/**
 * EAS (Ethereum Attestation Service) Integration
 * 
 * Provides server-side attestation for experiment results on Base L2.
 * This is the "Stealth Crypto Anchor" - users don't need wallets.
 * 
 * Uses viem directly for better compatibility and control.
 */

import {
    createWalletClient,
    createPublicClient,
    http,
    Hex,
    encodeAbiParameters,
    parseAbiParameters,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import crypto from 'crypto';

// EAS contract address on Base Mainnet
const EAS_CONTRACT_ADDRESS = '0x4200000000000000000000000000000000000021';

// Base Mainnet RPC
const RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

// Schema UID from .env (pre-registered)
const DATALYST_SCHEMA_UID = process.env.EAS_SCHEMA_UID ||
    '0x121062e4b9590b821fddeec7affc8d5ed417c04ef7bc9f58e05be185f6e3b071';

// EAS attest function ABI
const EAS_ABI = [
    {
        name: 'attest',
        type: 'function',
        inputs: [
            {
                name: 'request',
                type: 'tuple',
                components: [
                    { name: 'schema', type: 'bytes32' },
                    {
                        name: 'data',
                        type: 'tuple',
                        components: [
                            { name: 'recipient', type: 'address' },
                            { name: 'expirationTime', type: 'uint64' },
                            { name: 'revocable', type: 'bool' },
                            { name: 'refUID', type: 'bytes32' },
                            { name: 'data', type: 'bytes' },
                            { name: 'value', type: 'uint256' },
                        ],
                    },
                ],
            },
        ],
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'payable',
    },
] as const;

export interface ExperimentData {
    experimentId: string;
    protocolId?: string;
    name: string;
    hypothesis?: string;
    startDate: string;
    endDate: string;
    type: string;
    isBlind: boolean;
    results: {
        effectSize: number;
        pValue?: number;
        conditionAMean: number;
        conditionBMean: number;
        nA: number;
        nB: number;
    };
}

export interface AttestationResult {
    success: boolean;
    uid?: string;
    txHash?: string;
    dataHash?: string;
    error?: string;
    explorerUrl?: string;
}

/**
 * Generate a deterministic SHA256 hash of experiment data
 * This hash is what gets attested on-chain
 */
export function hashExperimentData(data: ExperimentData): string {
    // Create a canonical JSON representation (sorted keys)
    const canonical = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(canonical).digest('hex');
}
/**
 * Encode attestation data according to our schema:
 * "bytes32 dataHash, string experimentId, string protocolId, uint64 timestamp"
 */
function encodeAttestationData(
    dataHash: Hex,
    experimentId: string,
    protocolId: string,
    timestamp: bigint
): Hex {
    return encodeAbiParameters(
        parseAbiParameters('bytes32, string, string, uint64'),
        [dataHash, experimentId, protocolId, timestamp]
    );
}

// Minimum balance thresholds
const MIN_BALANCE_FOR_ATTESTATION = BigInt(20000000000000); // 0.00002 ETH (~4 attestations)
const LOW_BALANCE_WARNING = BigInt(100000000000000); // 0.0001 ETH (~22 attestations)

/**
 * Check wallet balance and return status
 */
export async function checkAttestationBalance(): Promise<{
    balance: bigint;
    balanceEth: number;
    canAttest: boolean;
    isLow: boolean;
    estimatedAttestations: number;
}> {
    const privateKey = process.env.EAS_PRIVATE_KEY;

    if (!privateKey) {
        return {
            balance: BigInt(0),
            balanceEth: 0,
            canAttest: false,
            isLow: true,
            estimatedAttestations: 0,
        };
    }

    const account = privateKeyToAccount(privateKey as Hex);
    const publicClient = createPublicClient({
        chain: base,
        transport: http(RPC_URL),
    });

    const balance = await publicClient.getBalance({ address: account.address });
    const balanceEth = Number(balance) / 1e18;
    const estimatedAttestations = Math.floor(Number(balance) / 4500000000000); // ~0.0000045 ETH per attestation

    return {
        balance,
        balanceEth,
        canAttest: balance >= MIN_BALANCE_FOR_ATTESTATION,
        isLow: balance < LOW_BALANCE_WARNING,
        estimatedAttestations,
    };
}

/**
 * Create an attestation for an experiment on Base via EAS
 */
export async function attestExperiment(data: ExperimentData): Promise<AttestationResult> {
    try {
        const privateKey = process.env.EAS_PRIVATE_KEY;

        if (!privateKey) {
            return {
                success: false,
                error: 'EAS_PRIVATE_KEY not configured. Attestation skipped.',
            };
        }

        // Check balance before attempting attestation
        const balanceCheck = await checkAttestationBalance();

        if (!balanceCheck.canAttest) {
            console.warn(`[EAS] Insufficient balance for attestation: ${balanceCheck.balanceEth} ETH`);
            return {
                success: false,
                error: 'LOW_BALANCE',
            };
        }

        if (balanceCheck.isLow) {
            console.warn(`[EAS] Low balance warning: ${balanceCheck.balanceEth} ETH (~${balanceCheck.estimatedAttestations} attestations remaining)`);
        }

        if (!DATALYST_SCHEMA_UID || DATALYST_SCHEMA_UID.startsWith('0x00000000')) {
            return {
                success: false,
                error: 'EAS_SCHEMA_UID not configured. Attestation skipped.',
            };
        }

        // Generate the data hash
        const dataHash = hashExperimentData(data);
        const dataHashBytes32 = `0x${dataHash}` as Hex;

        // Create clients
        const account = privateKeyToAccount(privateKey as Hex);

        const walletClient = createWalletClient({
            account,
            chain: base,
            transport: http(RPC_URL),
        });

        const publicClient = createPublicClient({
            chain: base,
            transport: http(RPC_URL),
        });

        // Encode the attestation data
        const encodedData = encodeAttestationData(
            dataHashBytes32,
            data.experimentId,
            data.protocolId || '',
            BigInt(Math.floor(Date.now() / 1000))
        );

        // Build the attestation request
        const request = {
            schema: DATALYST_SCHEMA_UID as Hex,
            data: {
                recipient: '0x0000000000000000000000000000000000000000' as Hex,
                expirationTime: BigInt(0),
                revocable: false,
                refUID: '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex,
                data: encodedData,
                value: BigInt(0),
            },
        };

        console.log('[EAS] Submitting attestation...');

        // Send the attest transaction
        const txHash = await walletClient.writeContract({
            address: EAS_CONTRACT_ADDRESS,
            abi: EAS_ABI,
            functionName: 'attest',
            args: [request],
        });

        console.log(`[EAS] Transaction submitted: ${txHash}`);

        // Wait for confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

        if (receipt.status !== 'success') {
            return {
                success: false,
                error: 'Transaction failed',
            };
        }

        // Extract attestation UID from logs
        // The Attested event has: (recipient, attester, uid, schema)
        // The uid is in the data field (first 32 bytes since it's non-indexed)
        const attestedEvent = receipt.logs.find(log =>
            log.address.toLowerCase() === EAS_CONTRACT_ADDRESS.toLowerCase()
        );

        // The data contains the uid as a bytes32 (first 32 bytes)
        const attestationUid = attestedEvent?.data?.slice(0, 66) || null;

        if (!attestationUid) {
            // Fallback: try to get from logs in a different way
            console.log('[EAS] Logs:', JSON.stringify(receipt.logs, null, 2));
            return {
                success: false,
                error: 'Could not find attestation UID in transaction logs',
            };
        }

        const explorerUrl = `https://base.easscan.org/attestation/view/${attestationUid}`;

        console.log(`[EAS] Attestation created: ${attestationUid}`);

        return {
            success: true,
            uid: attestationUid,
            txHash: txHash,
            dataHash: dataHash,
            explorerUrl,
        };
    } catch (error) {
        console.error('[EAS] Attestation failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Verify that a given data hash matches the original experiment data
 */
export function verifyDataHash(data: ExperimentData, expectedHash: string): boolean {
    const actualHash = hashExperimentData(data);
    return actualHash === expectedHash;
}

/**
 * Get the EAS explorer URL for an attestation
 */
export function getAttestationExplorerUrl(uid: string): string {
    return `https://base.easscan.org/attestation/view/${uid}`;
}

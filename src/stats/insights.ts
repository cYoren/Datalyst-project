import { CorrelationResult } from './correlations';
import { TTestResult, ChiSquareResult } from './tests';

/**
 * Generates natural language insights from statistical results
 */
export class InsightGenerator {

    static interpretCorrelation(
        var1Name: string,
        var2Name: string,
        result: CorrelationResult
    ): string {
        const strength = Math.abs(result.coefficient);
        const direction = result.coefficient > 0 ? 'positiva' : 'negativa';
        const isSignificant = result.pValue < 0.05;

        if (!isSignificant) {
            return `Não encontramos relação estatisticamente relevante entre ${var1Name} e ${var2Name} nos dados atuais.`;
        }

        let strengthText = '';
        if (strength > 0.7) strengthText = 'muito forte';
        else if (strength > 0.5) strengthText = 'forte';
        else if (strength > 0.3) strengthText = 'moderada';
        else strengthText = 'leve';

        const action = result.coefficient > 0 ? 'aumenta' : 'diminui';

        return `Existe uma correlação ${direction} ${strengthText} entre ${var1Name} e ${var2Name}. Geralmente, quando ${var1Name} aumenta, ${var2Name} tende a ${action}.`;
    }

    static interpretTTest(
        group1Name: string,
        group2Name: string,
        variableName: string,
        result: TTestResult
    ): string {
        if (!result.significant) {
            return `A diferença de ${variableName} entre dias de ${group1Name} e ${group2Name} não é estatisticamente significativa.`;
        }

        const diff = Math.abs(result.meanDiff).toFixed(1);
        const higherGroup = result.meanDiff > 0 ? group1Name : group2Name;

        return `Em dias de ${higherGroup}, seu nível de ${variableName} é, em média, ${diff} pontos maior do que em dias de ${higherGroup === group1Name ? group2Name : group1Name}.`;
    }

    static interpretChiSquare(
        var1Name: string,
        var2Name: string,
        result: ChiSquareResult
    ): string {
        if (!result.significant) {
            return `Não parece haver conexão direta entre fazer ${var1Name} e ${var2Name}.`;
        }

        return `Existe uma associação significativa entre ${var1Name} e ${var2Name}. Esses hábitos tendem a acontecer (ou não acontecer) juntos com mais frequência do que o acaso explicaria.`;
    }
}

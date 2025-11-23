import { redirect } from 'next/navigation';

export default function Home() {
  // In a real app, check session here.
  // If no session -> /onboarding (or login)
  // If session -> /dashboard

  // For MVP, we'll assume new user goes to onboarding if no cookie/localstorage, 
  // but server-side we can't check localstorage easily without client component.
  // Let's redirect to /onboarding by default for the demo flow.
  // Or better: /dashboard, and if empty, /dashboard shows empty state with CTA.

  redirect('/onboarding');
}

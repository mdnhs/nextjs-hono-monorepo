import { redirect } from 'next/navigation';

export default function StoreAdminRedirect() {
  redirect('/dashboard');
}

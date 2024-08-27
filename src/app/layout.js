import './globals.css';
import Navbar from './components/Nav/Navbar';
import { headers } from 'next/headers'
import { cookieToInitialState } from 'wagmi'
import { config } from '@/app/config';
import Web3ModalProvider from "@/app/context";
import Footer from './components/Footer';

export const metadata = {
  title: 'CCIP X Rev3al',
  description: 'Create crosschain tokens with ease',
};

export default function RootLayout({ children }) {
  const initialState = cookieToInitialState(config, headers().get('cookie'))

  return (
    <html lang="en">
      <body>
      <Web3ModalProvider initialState={initialState}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        </Web3ModalProvider>
      </body>
    </html>
  );
}

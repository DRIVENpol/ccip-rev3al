import Link from 'next/link';

export default function NavbarLink({ href, children }) {
    return (
        <Link href={href} className="mx-2 text-lg hover:text-blue-600">
            {children}
        </Link>
    );
}

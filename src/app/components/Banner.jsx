export default function Banner() {
    const logos = [
        {
            src: "https://cryptologos.cc/logos/bnb-bnb-logo.png?v=033",
            alt: "BSC Logo",
        },
        {
            src: "https://github.com/base-org/brand-kit/blob/main/logo/symbol/Base_Symbol_Blue.png?raw=true",
            alt: "Base Logo",
        },
    ];

    return (
        <section className="bg-gradient-to-r from-blue-500 to-blue-800 py-8">
            <div className="container mx-auto">
                <h2 className="text-white text-3xl font-bold text-center mb-8">
                    Supported Chains
                </h2>

                <div className="flex flex-wrap justify-center gap-8">
                    {logos.map((logo, index) => (
                        <div key={index} className="bg-white p-3 rounded-full shadow-lg">
                            <img src={logo.src} alt={logo.alt} className="h-12" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

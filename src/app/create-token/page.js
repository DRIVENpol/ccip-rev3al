import CreateTokenForm from '../components/CreateTokenForm';
import CreateNFTForm from '../components/CreateNFTForm';
import MyAssets from '../components/MyAssets';
import BannerCreate from '../components/BannerCreate';
import SupportBanner from '../components/SupportBanner';

export default function CreateTokenPage() {
    return (
        <div className="bg-white min-h-screen flex flex-col justify-between">
            <div className="container mx-auto px-4 py-8 flex-grow">
                <BannerCreate />
                <div className="flex flex-col md:flex-row md:space-x-8">
                    <div className="md:w-1/2 mb-8 md:mb-0">
                        <CreateTokenForm />
                    </div>
                    <div className="md:w-1/2">
                        <CreateNFTForm />
                    </div>
                </div>
                <div className="mt-8">
                    <MyAssets />
                </div>
            </div>
            <SupportBanner />
        </div>
    );
}
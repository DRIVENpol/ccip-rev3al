import StepForm from '../components/StepFrom';
import MyCrosschainAssets from '../components/MyCrosschainAssets';
import SupportBanner from '../components/SupportBanner';

export default function DashboardPage() {
    return (
        <div className="bg-white min-h-screen flex flex-col justify-between">
            <div className="container mx-auto px-4 py-8 flex-grow">
                <div className="space-y-8">
                    <StepForm />
                    <MyCrosschainAssets />
                </div>
            </div>
            <SupportBanner />
        </div>
    );
}

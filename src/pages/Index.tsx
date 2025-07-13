import { useAuth } from '@/hooks/useAuth';
import Auth from '@/components/Auth';
import WhatsAppChat from '@/components/WhatsAppChat';
import { Toaster } from '@/components/ui/toaster';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary-light/10">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full mx-auto animate-pulse"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? <WhatsAppChat /> : <Auth onAuthSuccess={() => {}} />}
      <Toaster />
    </>
  );
};

export default Index;

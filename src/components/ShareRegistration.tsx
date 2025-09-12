import { Copy, ExternalLink, MessageCircle } from 'lucide-react';
import { cfg, createRegistrationShareMessage } from '@/lib/config';
import { useToast } from '@/hooks/use-toast';

interface ShareRegistrationProps {
  onClose?: () => void;
}

const ShareRegistration = ({ onClose }: ShareRegistrationProps) => {
  const { toast } = useToast();

  const getRegistrationUrl = () => {
    return typeof window !== 'undefined' ? `${window.location.origin}/register` : '/register';
  };

  const handleWhatsAppShare = () => {
    const message = createRegistrationShareMessage(window.location.origin);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onClose?.();
  };

  const handleCopyLink = async () => {
    const url = getRegistrationUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Registration link copied to clipboard",
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Link copied!",
        description: "Registration link copied to clipboard",
      });
    }
    onClose?.();
  };

  const handleOpenRegistration = () => {
    const url = getRegistrationUrl();
    window.open(url, '_blank');
    onClose?.();
  };

  return (
    <div className="space-y-1">
      <button
        onClick={handleWhatsAppShare}
        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
      >
        <MessageCircle size={16} className="mr-3 text-green-600" />
        Share via WhatsApp
      </button>
      
      <button
        onClick={handleCopyLink}
        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
      >
        <Copy size={16} className="mr-3 text-gray-600" />
        Copy Registration Link
      </button>
      
      <button
        onClick={handleOpenRegistration}
        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
      >
        <ExternalLink size={16} className="mr-3 text-blue-600" />
        Open Registration Page
      </button>
    </div>
  );
};

export default ShareRegistration;
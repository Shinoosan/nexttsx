// components/proxy-settings.tsx
import { useState } from 'react';
import { Card } from './ui/card';
import { AnimatedButton } from './ui/animated-button';
import { toast } from './ui/use-toast';

const ProxySettings = () => {
  const [proxyInput, setProxyInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const checkProxy = async () => {
    if (!proxyInput.match(/^[\w\.]+:\d+:[\w\.]+:[\w\.]+$/)) {
      toast({
        title: "Invalid Format",
        description: "Please use format: IP:PORT:USER:PASS",
        variant: "destructive"
      });
      return;
    }

    setIsChecking(true);
    try {
      const response = await fetch('/api/check-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proxy: proxyInput }),
      });

      const data = await response.json();

      if (data.isLive) {
        // Save to MongoDB
        await fetch('/api/save-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proxy: proxyInput }),
        });

        toast({
          title: "Proxy is Live",
          description: "Proxy has been saved and will be used for your requests",
          variant: "success"
        });
      } else {
        toast({
          title: "Dead Proxy",
          description: "Please try another proxy",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check proxy",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Proxy Settings</h3>
      <textarea
        className="w-full h-24 p-4 rounded-xl mb-4 bg-background text-foreground border focus:ring-2 focus:ring-primary outline-none resize-none transition-colors duration-200 font-mono text-sm"
        placeholder="Enter proxy in format: IP:PORT:USER:PASS"
        value={proxyInput}
        onChange={(e) => setProxyInput(e.target.value)}
      />
      <AnimatedButton
        onClick={checkProxy}
        isProcessing={isChecking}
        className="w-full"
      >
        {isChecking ? "Checking..." : "Set Proxy"}
      </AnimatedButton>
    </Card>
  );
};

export default ProxySettings;
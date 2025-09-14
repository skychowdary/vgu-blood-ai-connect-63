import { createTelegramEmergencyMessage } from './config';

export interface TelegramEmergencyRequest {
  blood_group: string;
  units_needed: number;
  hospital?: string | null;
  location?: string | null;
  contact_phone?: string | null;
  need_by?: string | null;
  requester_name?: string | null;
}

// Test function to verify server API connection
export async function testTelegramConnection(): Promise<{ success: boolean; error?: string; chatInfo?: any }> {
  try {
    const testMessage = "🔧 <b>Connection Test</b>\n\n✅ VGU Blood Finder AI is now connected and ready to send emergency alerts!";
    
    const response = await fetch('/api/telegram-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: testMessage })
    });

    if (!response.ok) {
      let errorMessage = `Server API error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage += ` - ${errorData.error}`;
      } catch {
        // If JSON parsing fails, use the status text
        errorMessage += ` - ${response.statusText}`;
      }
      return { success: false, error: errorMessage };
    }

    const result = await response.json();
    return { success: true, chatInfo: { title: 'VGU Blood Finder AI', id: 'server-api' } };
  } catch (error) {
    return { success: false, error: `Connection test failed: ${error}` };
  }
}

export async function sendTelegramAlert(req: TelegramEmergencyRequest): Promise<void> {
  const text = createTelegramEmergencyMessage(req);

  try {
    const response = await fetch('/api/telegram-send', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      let errorMessage = `Server API error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage += ` - ${errorData.error}`;
      } catch {
        // If JSON parsing fails, use the status text
        errorMessage += ` - ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
  } catch (error) {
    console.error('Failed to send Telegram alert:', error);
    throw error;
  }
}

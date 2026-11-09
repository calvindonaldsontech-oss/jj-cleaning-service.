const N8N_WEBHOOK_URL = 'https://jj-cleaning-servive.app.n8n.cloud/webhook/jj-cleaning-quote';

const handleBookingSubmit = async (formData: any) => {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        timestamp: new Date().toISOString(),
        source: 'JJ Cleaning PWA',
      }),
    });

    if (response.ok) {
      console.log('Quote payload successfully sent to n8n!');
    }
  } catch (error) {
    console.error('Error triggering n8n webhook:', error);
  }
};

import axios from 'axios';

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;

export const sendAudioEmail = async (email, audioBlob, storyTitle) => {
  try {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    
    return new Promise((resolve) => {
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];
        
        const response = await axios.post('https://api.resend.com/emails', {
          from: 'Story App <stories@yourdomain.com>',
          to: [email],
          subject: `Your Audio Story: ${storyTitle}`,
          html: `<p>Here's your audio story: ${storyTitle}</p>`,
          attachments: [{
            content: base64Audio,
            filename: `${storyTitle.replace(/\s+/g, '_')}.mp3`,
            type: 'audio/mpeg',
            disposition: 'attachment'
          }]
        }, {
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        resolve(response.data);
      };
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
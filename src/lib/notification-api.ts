import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_NOTIFICATION_API_URL ||
    'https://api.zone4build.com/notification';

// Get shop ID dynamically from environment
const getShopId = () => {
    // Use NEXT_PUBLIC_TENANT_ID which is already configured in .env
    return process.env.NEXT_PUBLIC_TENANT_ID || 'store111'; // fallback
};

/**
 * Register FCM token with the notification-api backend
 */
export const registerFCMToken = async (
    token: string,
    userId: string,
    authToken: string
) => {
    const shopId = getShopId();

    try {
        const response = await axios.post(
            `${API_BASE_URL}/${shopId}/firebase_registration`,
            {
                token,
                creator_id: userId,
                created: new Date().toISOString()
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ FCM token registered successfully:', response.data);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 409) {
            console.log('ℹ️ FCM token already registered');
            return error.response.data;
        }
        console.error('❌ Error registering FCM token:', error.response?.data || error.message);
        throw error;
    }
};
/**
 * Subscribe FCM token to a specific topic
 */
export const subscribeToTopic = async (
    token: string,
    topic: string,
    authToken: string
) => {
    const shopId = getShopId();

    try {
        const response = await axios.post(
            `${API_BASE_URL}/${shopId}/firebase_registration/subscribe-topic`,
            {
                token,
                topic
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log(`✅ Subscribed to topic: ${topic}`);
        return response.data;
    } catch (error: any) {
        console.error(`❌ Error subscribing to topic ${topic}:`, error.response?.data || error.message);
    }
};

/**
 * Unregister FCM token from the backend
 */
export const unregisterFCMToken = async (
    tokenId: number,
    authToken: string
) => {
    const shopId = getShopId();

    try {
        const response = await axios.delete(
            `${API_BASE_URL}/${shopId}/firebase_registration/${tokenId}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ FCM token unregistered successfully');
        return response.data;
    } catch (error: any) {
        console.error('❌ Error unregistering FCM token:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Send a contact form message to the shop via notification-api.
 * @param input  { name, email, subject, description }
 * @param shopEmail  Optional shop email. If not set, the api falls back to EMAIL.CONTACT_MAIL
 * @param locale  Locale code, e.g. 'fr', 'en'
 */
export const contactShop = async (
    input: { name: string; email: string; subject: string; description: string },
    shopEmail?: string,
    locale: string = 'fr'
) => {
    const shopId = getShopId();

    const body: Record<string, string> = {
        sender: input.email,
        subject: `[${input.name}] ${input.subject}`,
        text: input.description,
    };

    // Only add recipient if the shop has its own email configured
    if (shopEmail) {
        body.recipient = shopEmail;
    }

    try {
        const response = await axios.post(
            `${API_BASE_URL}/${shopId}/contactUs/${locale}`,
            body,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return { success: true, data: response.data };
    } catch (error: any) {
        console.error('❌ Error sending contact email:', error.response?.data || error.message);
        return { success: false };
    }
};


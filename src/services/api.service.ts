import axios from 'axios';

interface ApiSendParams {
    method: string;
    url: string;
    params: Record<string, string>;
    headers: Record<string, string>;
    data: object;
    timeout: number;
}

export async function sendToApi({ method, url, params, headers, data, timeout }: ApiSendParams): Promise<boolean> {
    try {
        const response = await axios.request({
            method,
            url,
            params,
            headers,
            data,
            timeout,
        });
        return response.status === 200;
    } catch (error) {
        console.error('API send failure:', error);
        return false;
    }
}

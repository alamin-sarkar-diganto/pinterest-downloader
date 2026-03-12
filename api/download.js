export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { url } = req.body;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            }
        });
        const html = await response.text();

        // Regex to find Pinterest media URLs (this is the simplified high-performance logic)
        let downloadUrl = "";
        let type = "image";
        
        // Try video extraction first
        const videoMatch = html.match(/"contentUrl":"(.*?)"/);
        const imgMatch = html.match(/"image":"(.*?)"/) || html.match(/property="og:image" content="(.*?)"/);

        if (videoMatch && videoMatch[1]) {
            downloadUrl = videoMatch[1];
            type = "video";
        } else if (imgMatch && imgMatch[1]) {
            // Convert to high-res version if it's an image
            downloadUrl = imgMatch[1].replace('originals', '736x').replace(/736x/, 'originals');
            type = "image";
        }

        if (!downloadUrl) {
            return res.status(404).json({ success: false, error: 'Media not found' });
        }

        return res.status(200).json({
            success: true,
            downloadUrl,
            thumb: downloadUrl,
            type
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

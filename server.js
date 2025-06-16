import app from "./app.js"
import cloudinary from "cloudinary"

const port = process.env.PORT ||5000

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
    // url: "https://res.cloudinary.com/your_cloud_name/image/upload"
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
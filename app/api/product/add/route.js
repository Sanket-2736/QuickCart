import connectDB from '@/config/db';
import authSeller from '@/lib/authSeller';
import { getAuth } from '@clerk/nextjs/server';
import { vs as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import Product from '@/models/Product';




export async function POST(req) {
    cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
});
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      console.error('❌ No userId found in Clerk Auth');
      return NextResponse.json({ success: false, message: 'Authentication failed' }, { status: 401 });
    }

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      console.error('❌ Not a seller');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const formData = await req.formData();

    const name = formData.get('name');
    const description = formData.get('description');
    const price = formData.get('price');
    const offerPrice = formData.get('offerPrice');
    const category = formData.get('category');
    const files = formData.getAll('images');

    console.log("📥 Received data:", { name, price, offerPrice, category, filesCount: files.length });

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: 'No images provided' }, { status: 400 });
    }

    // Upload all images to Cloudinary
    const uploadResults = await Promise.all(
      files.map(async (file, index) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            (error, result) => {
              if (error) {
                console.error(`❌ Cloudinary upload error on image ${index}:`, error);
                reject(error);
              } else {
                resolve(result.secure_url);
              }
            }
          );
          uploadStream.end(buffer);
        });
      })
    );

    const imageUrls = uploadResults;

    await connectDB();

    const newProduct = new Product({
      userId,
      name,
      description,
      price: Number(price),
      offerPrice: Number(offerPrice),
      category,
      image: imageUrls,
      date: Date.now(),
    });

    await newProduct.save();

    return NextResponse.json(
      { success: true, message: 'Uploaded successfully!', newProduct },
      { status: 201 }
    );

  } catch (error) {
    console.error('💥 API Internal Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

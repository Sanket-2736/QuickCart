import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

const { getAuth } = require("@clerk/nextjs/server");

export async function GET(req) {
    try {
        await connectDB();
        const products = await Product.find({});
        return NextResponse.json({ success: true, products });
    } catch (error) {
        console.error("Error in GET request:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
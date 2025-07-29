import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/dist/types/server";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const {userId} = await getAuth(req);
        await connectDB();

        const user = awit User.findById(userId);

        const {cartItems} = user;
        return NextResponse.json({succuss : true, cartItems, message : "Cart fetched successfully"});
    } catch (error) {
        return NextResponse.json({
            success: false, message: error.message});
    }
}
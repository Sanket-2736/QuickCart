import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/dist/types/server";
import { accessedDynamicData } from "next/dist/server/app-render/dynamic-rendering";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const {userId} = getAuth(req);
        const {address, items} = await req.json();
        if(!address || items.length == 0){
            return NextResponse.json({
                success: false, message: "Address and items are required"
            })
        }

        const amount = items.reduce(async (acc, items) => {
            const product = await Product.findById(items.product);
            return acc + product.offerPrice * items.quantity;
        }, 0);

        await inngest.send({
            name: 'order/created',
            data: {
                userId,
                address,
                items,
                amount: amount + Math.floor(amount * 0.02),
                date: Date.now()
            }
        })

        const user = await User.findById(userId);
        user.cartItems = [];
        await user.save();

        return NextResponse.json({
            success: true, message: "Order created successfully"
        })
    } catch (error) {
        return NextResponse.json({
            success: false, message: error.message || "Failed to add address"
        })
    }
    
}
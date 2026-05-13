//get the user input from the client like { client name : "Tesla", item_cost_inr: 1000, "sales markup percentage": 25} and perform the calculation in the backend api route and return a PDF form 

import { NextRequest, NextResponse } from "next/server"

type Item = {
    client_name: string
    item_cost_inr: number
    sales_markup_percentage: number
}

export async function POST(request: NextRequest) {

    const data: Item = await request.json()

    // Get values
    const client_name = data.client_name
    const item_cost_inr = data.item_cost_inr
    const sales_markup_percentage = data.sales_markup_percentage

    // Business calculations
    const selling_price_inr =
        item_cost_inr * (1 + sales_markup_percentage / 100)

    const gross_profit_inr =
        selling_price_inr - item_cost_inr

    // Invoice ID
    const date = new Date()
    const year = date.getFullYear()

    const invoice_id =
        `KFM-PI-${year}-${Date.now()}`

    return NextResponse.json({
        client_name,
        invoice_id,
        selling_price_inr,
        gross_profit_inr,
        message: "Data received successfully"
    })
}
import { jsPDF } from "jspdf"
import 'jspdf-autotable'

type jsonDataType = {
  client_name: string
  item_cost_inr: number
  sales_markup_percentage: number
}

export default function GeneratePDF({ jsonData }: { jsonData: jsonDataType }) {
  const handleGenerate = () => {
    const doc = new jsPDF();
    doc.text("INVOICE")
  }
}
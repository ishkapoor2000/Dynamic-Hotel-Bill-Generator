"use client"

import { useState, useRef, useEffect } from "react"
import { format, differenceInDays, parse } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Printer, RefreshCw } from "lucide-react"
import JsBarcode from "jsbarcode"

export default function HotelBillGenerator() {
  const [formData, setFormData] = useState({
    hotelName: "Grand Royal Hotel",
    hotelAddress: "123 Luxury Avenue, New Delhi, India",
    customerName: "John Doe",
    customerAddress: "456 Guest Street, Mumbai, India",
    checkInDate: format(new Date(), "yyyy-MM-dd"),
    checkInTime: "14:00",
    checkOutDate: format(new Date(new Date().getTime() + 86400000), "yyyy-MM-dd"),
    checkOutTime: "12:00",
    roomNumber: "301",
    roomType: "Deluxe Suite",
    roomPrice: 5000,
    numberOfPeople: 2,
    gstPercentage: 18,
    serviceChargePercentage: 10,
    phoneNumber: "+91 98765 43210",
    billNumber: "INV-" + Math.floor(100000 + Math.random() * 900000),
  })

  const billRef = useRef(null)
  const barcodeRef = useRef(null)

  // Calculate total days
  const checkInDateObj = parse(formData.checkInDate, "yyyy-MM-dd", new Date())
  const checkOutDateObj = parse(formData.checkOutDate, "yyyy-MM-dd", new Date())
  const numberOfDays = Math.max(1, differenceInDays(checkOutDateObj, checkInDateObj))

  const handleInputChange = (e) => {
    const { name, value } = e.target
    // Convert numeric fields to numbers
    const numericFields = ["roomPrice", "numberOfPeople", "gstPercentage", "serviceChargePercentage"]

    if (numericFields.includes(name)) {
      setFormData({
        ...formData,
        [name]: value === "" ? "" : Number(value),
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  // Generate random bill number
  const generateRandomBillNumber = () => {
    const newBillNumber = "INV-" + Math.floor(100000 + Math.random() * 900000)
    setFormData({
      ...formData,
      billNumber: newBillNumber,
    })
  }

  // Calculate charges - ensure all values are numbers
  const roomPrice = Number(formData.roomPrice) || 0
  const roomTotal = roomPrice * numberOfDays
  const serviceCharge = (roomTotal * (Number(formData.serviceChargePercentage) || 0)) / 100
  const gstAmount = (roomTotal * (Number(formData.gstPercentage) || 0)) / 100
  const totalAmount = roomTotal + serviceCharge + gstAmount

  // Generate barcode when component mounts or billNumber changes
  useEffect(() => {
    generateBarcode()
  }, [formData.billNumber])

  const generateBarcode = () => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, formData.billNumber, {
          format: "CODE128",
          lineColor: "#000",
          width: 1.5,
          height: 40,
          displayValue: true,
        })
      } catch (error) {
        console.error("Error generating barcode:", error)
      }
    }
  }

  // Handle print functionality using native browser print
  const handlePrint = () => {
    // Generate barcode before printing
    generateBarcode()

    // Set the document title for the print filename
    const originalTitle = document.title
    document.title = `${formData.hotelName}-${formData.checkInDate}-${formData.checkOutDate}-${numberOfDays}-${totalAmount}-hotel-bill`

    // Create a new window for printing
    const printWindow = window.open("", "_blank")

    if (printWindow) {
      // Get the HTML content of the bill
      const billContent = billRef.current.innerHTML

      // Write the content to the new window
      printWindow.document.write(`
        <html>
          <head>
            <title>${document.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .bill-container { max-width: 210mm; margin: 0 auto; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; }
              th { background-color: #f8f8f8; text-align: left; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .text-center { text-align: center; }
              .border-b { border-bottom: 1px solid #ddd; padding-bottom: 16px; margin-bottom: 16px; }
              .mt-1 { margin-top: 4px; }
              .mt-2 { margin-top: 8px; }
              .mb-4 { margin-bottom: 16px; }
              .mb-6 { margin-bottom: 24px; }
              .p-4 { padding: 16px; }
              .rounded { border-radius: 4px; }
              .bg-gray-50 { background-color: #f9fafb; }
              .text-sm { font-size: 0.875rem; }
              .text-xs { font-size: 0.75rem; }
              .text-gray-600 { color: #4b5563; }
              .grid { display: grid; }
              .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
              .gap-4 { gap: 16px; }
              .uppercase { text-transform: uppercase; }
              .tracking-wide { letter-spacing: 0.025em; }
              .text-3xl { font-size: 1.875rem; }
              .text-xl { font-size: 1.25rem; }
              .border-t { border-top: 1px solid #ddd; padding-top: 16px; margin-top: 16px; }
              @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="bill-container">
              ${billContent}
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `)

      // Restore the original document title
      document.title = originalTitle
    } else {
      alert("Please allow pop-ups to print the bill")
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Hotel Bill Generator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Bill Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="hotelName">Hotel Name</Label>
              <Input id="hotelName" name="hotelName" value={formData.hotelName} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billNumber">Bill Number</Label>
              <div className="flex space-x-2">
                <Input id="billNumber" name="billNumber" value={formData.billNumber} onChange={handleInputChange} />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={generateRandomBillNumber}
                  title="Generate Random Bill Number"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="hotelAddress">Hotel Address</Label>
            <Input id="hotelAddress" name="hotelAddress" value={formData.hotelAddress} onChange={handleInputChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input id="customerName" name="customerName" value={formData.customerName} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerAddress">Customer Address</Label>
              <Input
                id="customerAddress"
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="checkInDate">Check-in Date</Label>
              <Input
                id="checkInDate"
                name="checkInDate"
                type="date"
                value={formData.checkInDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkInTime">Check-in Time</Label>
              <Input
                id="checkInTime"
                name="checkInTime"
                type="time"
                value={formData.checkInTime}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOutDate">Check-out Date</Label>
              <Input
                id="checkOutDate"
                name="checkOutDate"
                type="date"
                value={formData.checkOutDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOutTime">Check-out Time</Label>
              <Input
                id="checkOutTime"
                name="checkOutTime"
                type="time"
                value={formData.checkOutTime}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input id="roomNumber" name="roomNumber" value={formData.roomNumber} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomType">Room Type</Label>
              <Input id="roomType" name="roomType" value={formData.roomType} onChange={handleInputChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="roomPrice">Room Price (₹/night)</Label>
              <Input
                id="roomPrice"
                name="roomPrice"
                type="number"
                value={formData.roomPrice}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfPeople">Number of People</Label>
              <Input
                id="numberOfPeople"
                name="numberOfPeople"
                type="number"
                value={formData.numberOfPeople}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="gstPercentage">GST Percentage (%)</Label>
              <Input
                id="gstPercentage"
                name="gstPercentage"
                type="number"
                value={formData.gstPercentage}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceChargePercentage">Service Charge (%)</Label>
              <Input
                id="serviceChargePercentage"
                name="serviceChargePercentage"
                type="number"
                value={formData.serviceChargePercentage}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <Label htmlFor="phoneNumber">Contact Number</Label>
            <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
          </div>

          <div className="flex justify-end">
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print Bill
            </Button>
          </div>
        </Card>

        {/* Bill Preview Section */}
        <div className="bg-white p-6 border rounded-lg shadow-sm">
          <div ref={billRef} className="bg-white p-8 max-w-[210mm] mx-auto">
            {/* Bill Header */}
            <div className="text-center mb-6 border-b pb-4">
              <h1 className="text-3xl font-bold uppercase tracking-wide">{formData.hotelName}</h1>
              <p className="text-gray-600 mt-1">{formData.hotelAddress}</p>
              <p className="text-gray-600 mt-1">Phone: {formData.phoneNumber}</p>
              <div className="flex justify-center mt-2">
                <div className="border-t-2 border-gray-300 w-24"></div>
              </div>
              <h2 className="text-xl font-semibold mt-2">INVOICE</h2>
            </div>

            {/* Bill Information */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="font-semibold">Bill To:</p>
                <p>{formData.customerName}</p>
                <p className="text-sm text-gray-600">{formData.customerAddress}</p>
              </div>
              <div className="text-right">
                <p>
                  <span className="font-semibold">Invoice No:</span> {formData.billNumber}
                </p>
                <p>
                  <span className="font-semibold">Date:</span> {format(checkOutDateObj, "dd/MM/yyyy")}
                </p>
              </div>
            </div>

            {/* Stay Information */}
            <div className="mb-6 border p-4 rounded bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>
                    <span className="font-semibold">Check-in:</span> {format(checkInDateObj, "dd/MM/yyyy")} at{" "}
                    {formData.checkInTime}
                  </p>
                  <p>
                    <span className="font-semibold">Room Number:</span> {formData.roomNumber}
                  </p>
                  <p>
                    <span className="font-semibold">Guests:</span> {formData.numberOfPeople}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-semibold">Check-out:</span> {format(checkOutDateObj, "dd/MM/yyyy")} at{" "}
                    {formData.checkOutTime}
                  </p>
                  <p>
                    <span className="font-semibold">Room Type:</span> {formData.roomType}
                  </p>
                  <p>
                    <span className="font-semibold">Stay Duration:</span> {numberOfDays}{" "}
                    {numberOfDays === 1 ? "night" : "nights"}
                  </p>
                </div>
              </div>
            </div>

            {/* Charges Table */}
            <table className="w-full mb-6 border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Description</th>
                  <th className="border p-2 text-right">Rate (₹)</th>
                  <th className="border p-2 text-right">Nights</th>
                  <th className="border p-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">{formData.roomType}</td>
                  <td className="border p-2 text-right">{roomPrice.toFixed(2)}</td>
                  <td className="border p-2 text-right">{numberOfDays}</td>
                  <td className="border p-2 text-right">{roomTotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="border p-2" colSpan={3}>
                    Service Charge ({formData.serviceChargePercentage}%)
                  </td>
                  <td className="border p-2 text-right">{serviceCharge.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="border p-2" colSpan={3}>
                    GST ({formData.gstPercentage}%)
                  </td>
                  <td className="border p-2 text-right">{gstAmount.toFixed(2)}</td>
                </tr>
                <tr className="font-bold">
                  <td className="border p-2" colSpan={3}>
                    Total Amount
                  </td>
                  <td className="border p-2 text-right">₹{totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t">
              <div className="flex justify-center mb-4">
                <canvas ref={barcodeRef}></canvas>
              </div>
              <div className="text-center text-sm text-gray-600">
                <p>Thank you for choosing {formData.hotelName}!</p>
                <p>For inquiries, please contact: {formData.phoneNumber}</p>
                <p className="mt-2 text-xs">This is a computer-generated invoice and does not require a signature.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

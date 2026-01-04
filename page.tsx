"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Download, Upload, QrCode } from "lucide-react"
import QRCode from "qrcode"
import { Html5Qrcode } from "html5-qrcode"

export default function QRCodeMessenger() {
  const [message, setMessage] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [decodedMessage, setDecodedMessage] = useState("")
  const [error, setError] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    html5QrCodeRef.current = new Html5Qrcode("reader")

    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.clear()
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    }
  }, [])

  const generateQRCode = async () => {
    setError("")

    if (!message.trim()) {
      setError("Please enter a message")
      return
    }

    try {
      const url = await QRCode.toDataURL(message, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
      setQrCodeUrl(url)
    } catch (err) {
      setError("Failed to generate QR code")
      console.error(err)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl) return

    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = "qrcode.png"
    link.click()
  }

  const decodeQRCode = async (file: File) => {
    setError("")
    setDecodedMessage("")

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file")
      return
    }

    try {
      if (html5QrCodeRef.current) {
        const result = await html5QrCodeRef.current.scanFile(file, true)
        setDecodedMessage(result)
      }
    } catch (err) {
      setError("Failed to decode QR code. Make sure the image contains a valid QR code.")
      console.error(err)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      decodeQRCode(file)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            QR Code Messenger
          </h1>
          <p className="text-lg text-gray-600">Generate and decode QR codes instantly</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold">Generate QR Code</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="message">Enter Your Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-2 min-h-32"
                />
              </div>

              <Button onClick={generateQRCode} className="w-full" size="lg">
                <QrCode className="w-5 h-5 mr-2" />
                Generate QR Code
              </Button>

              {qrCodeUrl && (
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-lg border-2 border-gray-200 flex justify-center">
                    <img src={qrCodeUrl || "/placeholder.svg"} alt="Generated QR Code" className="w-64 h-64" />
                  </div>

                  <Button onClick={downloadQRCode} variant="outline" className="w-full bg-transparent" size="lg">
                    <Download className="w-5 h-5 mr-2" />
                    Download QR Code
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-semibold">Decode QR Code</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="qr-upload">Upload QR Code Image</Label>
                <Input id="qr-upload" type="file" accept="image/*" onChange={handleFileUpload} className="mt-2" />
                <p className="text-sm text-gray-500 mt-2">Supported formats: JPG, PNG, WebP</p>
              </div>

              {decodedMessage && (
                <div className="space-y-2">
                  <Label>Decoded Message</Label>
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <p className="text-green-800 break-words">{decodedMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        <div id="reader" className="hidden" />
      </div>
    </div>
  )
}

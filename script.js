// DOM Elements
const messageInput = document.getElementById("messageInput")
const generateBtn = document.getElementById("generateBtn")
const downloadBtn = document.getElementById("downloadBtn")
const uploadBtn = document.getElementById("uploadBtn")
const fileInput = document.getElementById("fileInput")
const copyBtn = document.getElementById("copyBtn")
const errorMessage = document.getElementById("errorMessage")
const qrcodeDisplay = document.getElementById("qrcodeDisplay")
const qrcodeContainer = document.getElementById("qrcode")
const decodedResult = document.getElementById("decodedResult")
const decodedText = document.getElementById("decodedText")

// Global variable to store QR code instance
let qrCodeInstance = null
let html5QrCodeScanner = null

// Import QRCode and Html5Qrcode
const QRCode = window.QRCode
const Html5Qrcode = window.Html5Qrcode

/**
 * Generate QR Code from input message
 */
generateBtn.addEventListener("click", () => {
  const message = messageInput.value.trim()

  // Input validation
  if (!message) {
    errorMessage.textContent = "Please enter a message"
    messageInput.focus()
    return
  }

  // Clear previous error
  errorMessage.textContent = ""

  // Clear previous QR code if exists
  if (qrcodeContainer) {
    qrcodeContainer.innerHTML = ""
  }

  // Generate new QR code
  try {
    qrCodeInstance = new QRCode(qrcodeContainer, {
      text: message,
      width: 256,
      height: 256,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    })

    // Show QR code display area
    qrcodeDisplay.classList.remove("hidden")

    // Scroll to QR code
    qrcodeDisplay.scrollIntoView({ behavior: "smooth", block: "nearest" })
  } catch (error) {
    errorMessage.textContent = "Failed to generate QR code"
    console.error("QR Code generation error:", error)
  }
})

/**
 * Download QR Code as PNG image
 */
downloadBtn.addEventListener("click", () => {
  const canvas = qrcodeContainer.querySelector("canvas")

  if (!canvas) {
    alert("No QR code to download")
    return
  }

  try {
    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.download = "qrcode.png"
      link.href = url
      link.click()

      // Clean up
      URL.revokeObjectURL(url)
    })
  } catch (error) {
    alert("Failed to download QR code")
    console.error("Download error:", error)
  }
})

/**
 * Trigger file input when upload button is clicked
 */
uploadBtn.addEventListener("click", () => {
  fileInput.click()
})

/**
 * Decode QR Code from uploaded image
 */
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0]

  if (!file) {
    return
  }

  // Check if file is an image
  if (!file.type.startsWith("image/")) {
    alert("Please upload a valid image file")
    return
  }

  if (!html5QrCodeScanner) {
    html5QrCodeScanner = new Html5Qrcode("reader")
  }

  html5QrCodeScanner
    .scanFile(file, true)
    .then((decodedMessage) => {
      // Display decoded message
      decodedText.textContent = decodedMessage
      decodedResult.classList.remove("hidden")

      // Scroll to result
      decodedResult.scrollIntoView({ behavior: "smooth", block: "nearest" })

      // Clear file input for next upload
      fileInput.value = ""
    })
    .catch((error) => {
      alert("Failed to decode QR code. Please make sure the image contains a valid QR code.")
      console.error("QR Code decode error:", error)
      fileInput.value = ""
    })
})

/**
 * Copy decoded text to clipboard
 */
copyBtn.addEventListener("click", () => {
  const text = decodedText.textContent

  if (!text) {
    return
  }

  // Copy to clipboard using modern API
  navigator.clipboard
    .writeText(text)
    .then(() => {
      // Show feedback
      const originalText = copyBtn.textContent
      copyBtn.textContent = "Copied!"
      copyBtn.style.background = "#27ae60"

      // Reset button after 2 seconds
      setTimeout(() => {
        copyBtn.textContent = originalText
        copyBtn.style.background = ""
      }, 2000)
    })
    .catch((error) => {
      alert("Failed to copy to clipboard")
      console.error("Clipboard error:", error)
    })
})

/**
 * Clear error message when user starts typing
 */
messageInput.addEventListener("input", () => {
  if (errorMessage.textContent) {
    errorMessage.textContent = ""
  }
})

/**
 * Allow Enter key to generate QR code (with Shift+Enter for new line)
 */
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault()
    generateBtn.click()
  }
})

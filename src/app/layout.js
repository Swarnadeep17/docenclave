// This is a minimal layout file to make the build pass.
// We will add our final code later.
export const metadata = {
  title: 'DocEnclave',
  description: 'Secure Offline Document Tools',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

import type { Metadata } from "next";
import "./globals.css";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme/theme';
import CssBaseline from '@mui/material/CssBaseline';
import { ClerkProvider } from "@clerk/nextjs";
import Navigation from "@/components/navigation";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <AppRouterCacheProvider>
            <CssBaseline />
              <ThemeProvider theme={theme}>
                <Navigation />
                {children}
              </ThemeProvider>
            </AppRouterCacheProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

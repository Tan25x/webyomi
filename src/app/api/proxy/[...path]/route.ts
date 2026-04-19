import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  
  try {
    // Reconstruct the original URL from the path
    const url = path.join("/");
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `/${url}?${searchParams}` : `/${url}`;
    
    // Fetch the content server-side
    const response = await axios.get(fullUrl, {
      responseType: 'arraybuffer',
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": request.headers.get("referer") || "",
      },
      timeout: 30000,
    });
    
    // Determine content type
    const contentType = response.headers["content-type"] || "image/jpeg";
    
    return new NextResponse(response.data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Error fetching content", { status: 502 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const body = await request.json();
  
  try {
    const url = path.join("/");
    const fullUrl = `/${url}`;
    
    const response = await axios.post(fullUrl, body, {
      responseType: 'arraybuffer',
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Content-Type": "application/json",
      },
    });
    
    const contentType = response.headers["content-type"] || "application/json";
    
    return new NextResponse(response.data, {
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Error in POST request", { status: 502 });
  }
}
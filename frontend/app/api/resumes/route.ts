// frontend/app/api/resumes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

export async function GET() {
  try {
    console.log("MONGODB_URI exists:", !!uri);

    if (!uri) {
      console.error("MONGODB_URI is not defined");
      return NextResponse.json(
        { error: "Database connection string not configured" },
        { status: 500 },
      );
    }

    // 🔴 TAMBAHKAN OPSI TLS UNTUK MENGATASI SSL ERROR
    const client = new MongoClient(uri, {
      tls: true,
      tlsAllowInvalidCertificates: true, // Untuk development, nonaktifkan di production nanti
      tlsAllowInvalidHostnames: true, // Untuk development
      serverSelectionTimeoutMS: 30000, // Timeout 30 detik
      connectTimeoutMS: 30000, // Timeout koneksi
    });

    console.log("Mencoba koneksi ke MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("smartresume");
    const collection = db.collection("resumes");

    const resumes = await collection.find({}).sort({ createdAt: -1 }).toArray();

    await client.close();

    return NextResponse.json({
      count: resumes.length,
      resumes: resumes.map((r) => ({ ...r, id: r._id.toString() })),
    });
  } catch (error: any) {
    console.error("❌ Database error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: error.message || "Failed to fetch resumes" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("MONGODB_URI exists:", !!uri);

    if (!uri) {
      console.error("MONGODB_URI is not defined");
      return NextResponse.json(
        { error: "Database connection string not configured" },
        { status: 500 },
      );
    }

    const resumeData = await request.json();
    console.log("Received resume data:", resumeData.personal?.email);

    // Validasi
    if (!resumeData.personal?.fullName || !resumeData.personal?.email) {
      return NextResponse.json(
        { error: "Full name and email are required" },
        { status: 400 },
      );
    }

    // 🔴 TAMBAHKAN OPSI TLS JUGA DI SINI
    const client = new MongoClient(uri, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });

    console.log("Mencoba koneksi ke MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("smartresume");
    const collection = db.collection("resumes");

    // Tambahkan timestamp
    resumeData.createdAt = new Date().toISOString();

    const result = await collection.insertOne(resumeData);
    console.log("Insert result:", result.insertedId);

    await client.close();

    return NextResponse.json(
      {
        message: "Resume created successfully",
        resume: {
          id: result.insertedId.toString(),
          ...resumeData,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("❌ Database error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: error.message || "Failed to create resume" },
      { status: 500 },
    );
  }
}

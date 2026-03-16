// frontend/app/api/resumes/route.ts
import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Please define MONGODB_URI environment variable");
}

// Koneksi ke MongoDB
if (process.env.NODE_ENV === "development") {
  // Dalam development, gunakan global variable agar tidak membuat banyak koneksi
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // Dalam production, buat koneksi baru
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

// GET - Ambil semua resumes
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("smartresume");
    const collection = db.collection("resumes");

    const resumes = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      count: resumes.length,
      resumes: resumes.map((r) => ({ ...r, id: r._id.toString() })),
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 },
    );
  }
}

// POST - Buat resume baru
export async function POST(request: Request) {
  try {
    const resumeData = await request.json();

    // Validasi
    if (!resumeData.personal?.fullName || !resumeData.personal?.email) {
      return NextResponse.json(
        { error: "Full name and email are required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("smartresume");
    const collection = db.collection("resumes");

    // Tambahkan timestamp
    resumeData.createdAt = new Date().toISOString();

    const result = await collection.insertOne(resumeData);

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
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 },
    );
  }
}

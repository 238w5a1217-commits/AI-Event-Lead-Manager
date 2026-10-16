import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Lead from '@/models/Lead';

// GET /api/leads - list all leads with search and filter
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const event = searchParams.get('event') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { event: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.followUpStatus = status;
    }

    if (event) {
      query.event = { $regex: event, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/leads error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// POST /api/leads - create a new lead
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { name, company, email, phone, event, notes, followUpStatus, tags } = body;

    if (!name || !company || !email || !event) {
      return NextResponse.json(
        { success: false, error: 'Name, company, email and event are required' },
        { status: 400 }
      );
    }

    const lead = new Lead({
      name,
      company,
      email,
      phone,
      event,
      notes,
      followUpStatus: followUpStatus || 'pending',
      tags: tags || [],
    });

    await lead.save();

    return NextResponse.json(
      { success: true, data: lead },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('POST /api/leads error:', error);
    if (error instanceof Error && error.message.includes('validation failed')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

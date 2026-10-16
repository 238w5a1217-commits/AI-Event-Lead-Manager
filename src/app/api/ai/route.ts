import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectToDatabase from '@/lib/mongodb';
import Lead from '@/models/Lead';
import mongoose from 'mongoose';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Fallback chain in case of temporary Google high-demand (503) spikes
const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
];

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { leadId, action } = body; // action: 'summarize' | 'draft'

    if (!leadId || !action) {
      return NextResponse.json(
        { success: false, error: 'leadId and action are required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid lead ID format' },
        { status: 400 }
      );
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    if (!lead.notes || lead.notes.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'This contact has no interaction notes to process. Please add some notes first.' },
        { status: 400 }
      );
    }

    let prompt = '';
    let resultField = '';

    if (action === 'summarize') {
      prompt = `You are an executive assistant helping a business professional follow up after an event.
Please provide a concise, natural, 2-3 sentence executive summary of these event interaction notes. Focus on what was discussed, what they need, and the recommended next step.

Contact: ${lead.name} (${lead.company})
Event: ${lead.event}
Notes:
"${lead.notes}"

Write a crisp, clear, human summary without buzzwords.`;
      resultField = 'aiSummary';
    } else if (action === 'draft') {
      prompt = `You are a professional writing a warm, authentic, personal follow-up email after meeting someone at a business event.
Write a ready-to-send email to this person.

Recipient: ${lead.name}
Company: ${lead.company}
Event Met At: ${lead.event}
Discussion Notes:
"${lead.notes}"

Guidelines:
- Subject line at the very top (e.g. Subject: Great meeting you at [Event])
- Warm, polite, conversational, and respectful
- Reference specific details from our conversation in the notes so it feels genuinely personal
- Clear, low-pressure next step (e.g., a brief 15-min call next week or sharing resources)
- Natural sign-off`;
      resultField = 'aiDraftMessage';
    } else {
      return NextResponse.json(
        { success: false, error: 'Action must be "summarize" or "draft"' },
        { status: 400 }
      );
    }

    let generatedText = '';
    let lastError: Error | null = null;

    // Try candidate models in order to avoid single-model 503 high-demand errors
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        generatedText = result.response.text().trim();
        if (generatedText) {
          console.log(`AI generation succeeded using model: ${modelName}`);
          break;
        }
      } catch (err: unknown) {
        console.warn(`Model ${modelName} encountered error:`, err instanceof Error ? err.message : err);
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    if (!generatedText) {
      throw lastError || new Error('All AI models are currently busy. Please try again in a few moments.');
    }

    // Save generated text directly back to the lead in MongoDB
    await Lead.findByIdAndUpdate(leadId, { $set: { [resultField]: generatedText } });

    return NextResponse.json({
      success: true,
      data: { [resultField]: generatedText },
    });
  } catch (error: unknown) {
    console.error('POST /api/ai error:', error);
    const message = error instanceof Error ? error.message : 'Server error processing AI request';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

# DocuMind

An AI-powered document intelligence platform built with Next.js 15, LangChain.js, and Pinecone.

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Authentication**: Clerk
- **AI/RAG**: LangChain.js, Google Gemini, Pinecone

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key (free tier available)
- Pinecone account and API key
- Clerk account and API keys

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.local.example` to `.env.local` and fill in your API keys:
   ```bash
   cp .env.local.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
docu-mind/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React components (organized by feature)
│   ├── lib/                    # Core utilities and integrations
│   │   ├── rag/               # RAG-specific logic (embeddings, vectorstore)
│   │   └── clerk/             # Authentication utilities
│   ├── actions/               # Server Actions
│   ├── types/                 # TypeScript type definitions
│   └── config/                # Configuration files
```

## Features (Planned)

- [ ] Document upload and processing
- [ ] AI-powered document Q&A
- [ ] Vector embedding generation
- [ ] Semantic search
- [ ] User authentication
- [ ] Dashboard interface

## License

MIT

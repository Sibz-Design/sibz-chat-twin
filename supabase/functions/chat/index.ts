import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { CohereClient } from "npm:cohere-ai";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// GitHub API functions
async function fetchGitHubContent(path = '') {
  const githubToken = Deno.env.get('GITHUB_TOKEN'); // Optional - for higher rate limits
  const repoOwner = 'Sibz-Design';
  const repoName = 'Sibz-Design';
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Supabase-Function'
  };
  if (githubToken) {
    headers['Authorization'] = `token ${githubToken}`;
  }
  try {
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;
    console.log('Fetching GitHub content from:', url);
    const response = await fetch(url, {
      headers
    });
    if (!response.ok) {
      console.log('GitHub API response status:', response.status);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub content:', error);
    return null;
  }
}
async function getFileContent(downloadUrl) {
  try {
    const response = await fetch(downloadUrl);
    if (!response.ok) return null;
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error fetching file content:', error);
    return null;
  }
}
async function buildRepoContext() {
  console.log('Building repository context...');
  // Get repository structure
  const contents = await fetchGitHubContent();
  if (!contents) return "Repository information unavailable.";
  let context = "# Sibz-Design Repository Information\n\n";
  // Get README first
  const readmeFile = contents.find((item)=>item.name.toLowerCase().includes('readme'));
  if (readmeFile && readmeFile.download_url) {
    console.log('Found README file');
    const readmeContent = await getFileContent(readmeFile.download_url);
    if (readmeContent) {
      context += "## README Content:\n" + readmeContent + "\n\n";
    }
  }
  // Get package.json for project info
  const packageFile = contents.find((item)=>item.name === 'package.json');
  if (packageFile && packageFile.download_url) {
    console.log('Found package.json');
    const packageContent = await getFileContent(packageFile.download_url);
    if (packageContent) {
      context += "## Package.json:\n```json\n" + packageContent + "\n```\n\n";
    }
  }
  // List all files and folders
  context += "## Repository Structure:\n";
  for (const item of contents){
    context += `- ${item.type === 'dir' ? '📁' : '📄'} ${item.name}\n`;
  }
  // Get important code files (limited to avoid token limits)
  const codeExtensions = [
    '.js',
    '.ts',
    '.jsx',
    '.tsx',
    '.py',
    '.html',
    '.css'
  ];
  const codeFiles = contents.filter((item)=>item.type === 'file' && codeExtensions.some((ext)=>item.name.endsWith(ext)) && item.size < 50000 // Limit file size
  ).slice(0, 5); // Limit number of files
  if (codeFiles.length > 0) {
    context += "\n## Key Code Files:\n";
    for (const file of codeFiles){
      console.log('Processing code file:', file.name);
      const content = await getFileContent(file.download_url);
      if (content) {
        const extension = file.name.split('.').pop();
        context += `\n### ${file.name}:\n\`\`\`${extension}\n${content.slice(0, 2000)}${content.length > 2000 ? '\n... (truncated)' : ''}\n\`\`\`\n`;
      }
    }
  }
  console.log('Repository context built, length:', context.length);
  return context;
}
serve(async (req)=>{
  console.log('Function called with method:', req.method);
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const { message } = await req.json();
    console.log('Received message:', message);
    // Get Cohere API key from environment
    const cohereApiKey = Deno.env.get('COHERE_API_KEY');
    if (!cohereApiKey) {
      throw new Error('COHERE_API_KEY not found in environment variables');
    }
    // Build repository context
    const repoContext = await buildRepoContext();
    // Enhanced prompt with repository context
    const systemPrompt = `You are SibzAI, the digital twin of Sibabalwe Desemela — an IT Support Specialist & AI/ML Enthusiast.

CRITICAL RESPONSE RULES:
- Keep responses SHORT and CONCISE (2-4 sentences for simple questions)
- Use masculine pronouns (he/him/his) when referring to Sibabalwe
- Format with clear structure: headings, bullet points, line breaks
- Be conversational and direct - no verbose explanations
- Never say "As an AI language model"

Key facts about Sibabalwe:
- Currently learning: Python, Flask, REST APIs, AI/ML, DevOps
- Main projects: AI Scrum Bot, AI Chatbots, AI Content Generator
- GitHub: github.com/Sibz-Design
- LinkedIn: in/sibabalwe-desemela-554789253

REPOSITORY CONTEXT (use only when relevant):
${repoContext}`;
    const enhancedPrompt = `${systemPrompt}

USER QUESTION: ${message}

Answer briefly and directly. Only provide detailed explanations if specifically asked for more details.`;
    // Initialize Cohere client
    const cohere = new CohereClient({
      token: cohereApiKey
    });
    console.log('Creating Cohere stream...');
    // Create chat stream with enhanced prompt
    const stream = await cohere.chatStream({
      model: 'command-r-plus',
      message: enhancedPrompt,
      maxTokens: 1000,
      temperature: 0.7
    });
    console.log('Cohere stream created successfully');
    // Create a ReadableStream for the response
    const responseStream = new ReadableStream({
      async start (controller) {
        console.log('Starting stream processing...');
        let hasContent = false;
        try {
          for await (const event of stream){
            console.log('Received event type:', event.eventType);
            // Handle different event types
            if (event.eventType === 'text-generation') {
              hasContent = true;
              const content = event.text || '';
              const data = `data: ${JSON.stringify({
                content
              })}\n\n`;
              controller.enqueue(new TextEncoder().encode(data));
            } else if (event.eventType === 'stream-end') {
              console.log('Stream ending...');
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
              controller.close();
              return;
            }
          }
          // If we get here without a stream-end event
          if (!hasContent) {
            console.log('No content generated during stream');
            const fallbackData = `data: ${JSON.stringify({
              content: "I'm having trouble accessing the repository information right now. Please try again."
            })}\n\n`;
            controller.enqueue(new TextEncoder().encode(fallbackData));
          }
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (streamError) {
          console.error('Stream processing error:', streamError);
          const errorData = `data: ${JSON.stringify({
            content: "Sorry, I encountered an error processing your request."
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(errorData));
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        }
      }
    });
    return new Response(responseStream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

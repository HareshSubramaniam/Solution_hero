/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-lg w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center">
        <h1 className="text-3xl font-semibold mb-3 tracking-tight text-white">Ready to Import</h1>
        <p className="text-neutral-400 mb-8 leading-relaxed">
          It looks like you want to convert a project from Replit, but you didn't include the code or files in your message!
        </p>
        
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 text-sm text-left mb-6">
          <p className="mb-3 font-medium text-neutral-300">How to bring your code over:</p>
          <ul className="space-y-3 text-neutral-400">
            <li className="flex items-start">
              <span className="mr-2 mt-0.5 text-neutral-500">1.</span>
              <span><strong>Paste your code</strong> directly into the chat.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-0.5 text-neutral-500">2.</span>
              <span><strong>Upload your project files</strong> using the attachment button (or drag and drop them here).</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-0.5 text-neutral-500">3.</span>
              <span><strong>Share a public GitHub link</strong> if your Replit is synced to a repository.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

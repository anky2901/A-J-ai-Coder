import React from "react";

export function AboutSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-100 mb-4">About A J AI Coder</h3>
        <div className="space-y-4 text-sm text-neutral-300">
          <div>
            <p className="font-medium text-neutral-200">Developer: Ajay Sharma</p>
            <p className="text-neutral-400 mt-1">Professional AI-Powered IDE</p>
          </div>
          
          <div>
            <p className="font-medium text-neutral-200 mb-2">Development Timeline</p>
            <ul className="space-y-1 text-neutral-400">
              <li>• Started: July 26, 2025</li>
              <li>• Released: December 3, 2025</li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-neutral-200 mb-2">Key Features</p>
            <ul className="space-y-1 text-neutral-400">
              <li>• AI-powered code assistance</li>
              <li>• Live file preview panel</li>
              <li>• Integrated development environment</li>
              <li>• Multi-model AI support</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-neutral-700">
            <a 
              href="https://github.com/anky2901/A-J-ai-Coder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              View on GitHub →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
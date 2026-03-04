import { useEffect, useState } from "react";
import { Key, Plus, Trash2, Copy, Check, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import type { TokenScope, CreateTokenRequest } from "@autovio/shared";

const SCOPE_LABELS: Record<TokenScope, string> = {
  "projects:read": "Read Projects",
  "projects:write": "Write Projects",
  "works:read": "Read Works",
  "works:write": "Write Works",
  "ai:analyze": "AI Analyze",
  "ai:generate": "AI Generate",
};

const ALL_SCOPES: TokenScope[] = [
  "projects:read",
  "projects:write",
  "works:read",
  "works:write",
  "ai:analyze",
  "ai:generate",
];

interface TokensPageProps {
  onBack: () => void;
}

export default function TokensPage({ onBack }: TokensPageProps) {
  const { tokens, tokensLoading, fetchTokens, createToken, deleteToken } = useAuthStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenScopes, setNewTokenScopes] = useState<TokenScope[]>([]);
  const [newTokenExpiry, setNewTokenExpiry] = useState<number | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTokenScopes.length === 0) {
      setError("Please select at least one scope");
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const request: CreateTokenRequest = {
        name: newTokenName,
        scopes: newTokenScopes,
        expiresInDays: newTokenExpiry,
      };
      const response = await createToken(request);
      setCreatedToken(response.token);
      setNewTokenName("");
      setNewTokenScopes([]);
      setNewTokenExpiry(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create token");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!createdToken) return;
    await navigator.clipboard.writeText(createdToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this token? This action cannot be undone.")) {
      return;
    }
    await deleteToken(id);
  };

  const toggleScope = (scope: TokenScope) => {
    setNewTokenScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">API Tokens</h1>
          <p className="text-gray-400 text-sm">
            Manage API tokens for external access to your projects
          </p>
        </div>
      </div>

      {createdToken && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-400 font-medium mb-2">
                Token created successfully!
              </p>
              <p className="text-gray-300 text-sm mb-3">
                Copy this token now. You won't be able to see it again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-gray-900 rounded text-sm text-gray-300 font-mono overflow-x-auto">
                  {createdToken}
                </code>
                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setCreatedToken(null);
              setShowCreateForm(false);
            }}
            className="mt-4 text-sm text-gray-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {!showCreateForm && !createdToken && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Token
        </button>
      )}

      {showCreateForm && !createdToken && (
        <div className="mb-6 p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Token</h3>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Token Name
              </label>
              <input
                type="text"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Production API"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Permissions
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_SCOPES.map((scope) => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => toggleScope(scope)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      newTokenScopes.includes(scope)
                        ? "bg-purple-600/20 border-purple-500 text-purple-300"
                        : "bg-gray-900/30 border-gray-700 text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    {SCOPE_LABELS[scope]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Expiration
              </label>
              <select
                value={newTokenExpiry ?? ""}
                onChange={(e) =>
                  setNewTokenExpiry(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Never expires</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Token"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {tokensLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No API tokens yet</p>
            <p className="text-sm">Create a token to access the API externally</p>
          </div>
        ) : (
          tokens.map((token) => (
            <div
              key={token.id}
              className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Key className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-white">{token.name}</span>
                  <code className="text-xs text-gray-500 font-mono">
                    {token.tokenPrefix}...
                  </code>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {token.scopes.map((scope) => (
                    <span
                      key={scope}
                      className="px-2 py-0.5 bg-gray-700/50 rounded text-xs text-gray-400"
                    >
                      {SCOPE_LABELS[scope]}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-500">
                  Created {formatDate(token.createdAt)}
                  {token.expiresAt && (
                    <span>
                      {" "}· Expires {formatDate(token.expiresAt)}
                    </span>
                  )}
                  {token.lastUsedAt && (
                    <span>
                      {" "}· Last used {formatDate(token.lastUsedAt)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(token.id)}
                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

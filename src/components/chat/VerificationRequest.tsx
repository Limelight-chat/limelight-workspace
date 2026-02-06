import React, { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2, ChartColumn } from "lucide-react"
import { api } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface VerificationRequestProps {
    pipelineTrace: any
    onSuccess: (result: any) => void
    onRelationshipsApproved?: () => void
}

export function VerificationRequest({ pipelineTrace, onSuccess, onRelationshipsApproved }: VerificationRequestProps) {
    const [feedback, setFeedback] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const sessionId = pipelineTrace.session_id
    const plan = pipelineTrace.analytical_plan || {}
    const relationshipCandidates = pipelineTrace.relationship_candidates || []

    // Extract the "question" from the plan if available
    // The backend might return "missing_terms" list
    const missingInfo = plan.missing_terms?.join(", ") || "Specific logic"

    const isRelationshipMode = plan.status === "MISSING_RELATIONSHIP" ||
        pipelineTrace.verification_required ||
        relationshipCandidates.length > 0

    // Reset feedback when the requirement changes to avoid stale text
    useEffect(() => {
        setFeedback("")
        setError(null)
    }, [missingInfo, plan.status])

    // Heuristic: Extract suggestion from explanation if possible, or just look for common columns in the UI later. 
    // Ideally backend sends this. For now let's assume the explanation contains the hint or we genericize.

    const handleApproveRelationships = async () => {
        if (!relationshipCandidates.length) return
        setSubmitting(true)
        setError(null)
        try {
            for (const cand of relationshipCandidates) {
                if (cand.id) {
                    await api.confirmRelationship(cand.id)
                } else {
                    await api.submitRelationshipFeedback({
                        from_table: cand.from_table,
                        to_table: cand.to_table,
                        from_column: cand.from_column,
                        to_column: cand.to_column,
                        action: "APPROVE"
                    })
                }
            }
            if (onRelationshipsApproved) {
                onRelationshipsApproved()
            }
        } catch (err: any) {
            console.error("Relationship approval failed:", err)
            setError(err.message || "Failed to approve relationships")
        } finally {
            setSubmitting(false)
        }
    }

    const handleRejectRelationships = async () => {
        if (!relationshipCandidates.length) return
        setSubmitting(true)
        setError(null)
        try {
            for (const cand of relationshipCandidates) {
                if (cand.id) {
                    await api.rejectRelationship(cand.id)
                } else {
                    await api.submitRelationshipFeedback({
                        from_table: cand.from_table,
                        to_table: cand.to_table,
                        from_column: cand.from_column,
                        to_column: cand.to_column,
                        action: "REJECT"
                    })
                }
            }
        } catch (err: any) {
            console.error("Relationship rejection failed:", err)
            setError(err.message || "Failed to reject relationships")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="bg-[#1f1e1e] border border-orange-500/30 rounded-2xl p-6 mt-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-start gap-4">
                <div className="bg-orange-500/10 p-2 rounded-full shrink-0">
                    <AlertCircle className="w-6 h-6 text-orange-500" />
                </div>

                <div className="flex-1 space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-orange-100">Clarification Needed</h3>
                        <p className="text-slate-400 mt-1">
                            {isRelationshipMode
                                ? "I can see the data tables, but I don't know how they relate."
                                : <>I need to verify the logic for <span className="text-orange-400 font-mono text-sm px-1.5 py-0.5 bg-orange-500/10 rounded-md">{missingInfo}</span> before proceeding.</>
                            }
                        </p>
                    </div>

                    <div className="bg-[#171616] rounded-xl p-4 border border-[#2e2d2d] space-y-3">
                        <div className="flex items-center gap-2 text-orange-400">
                            <ChartColumn className="w-4 h-4" />
                            <span className="text-sm font-semibold uppercase tracking-wider">Suggested Links</span>
                        </div>

                        {isRelationshipMode && relationshipCandidates.length > 0 ? (
                            <div className="space-y-2">
                                {relationshipCandidates.map((c: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between bg-[#0a0a0a] p-3 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-slate-200 font-medium">{c.from_table}</span>
                                            <span className="text-slate-500 text-xs px-1.5 py-0.5 bg-slate-800 rounded">{c.from_column}</span>
                                            <span className="text-slate-600">→</span>
                                            <span className="text-slate-200 font-medium">{c.to_table}</span>
                                            <span className="text-slate-500 text-xs px-1.5 py-0.5 bg-slate-800 rounded">{c.to_column}</span>
                                        </div>
                                        {c.confidence_score !== undefined && (
                                            <div className="text-xs text-emerald-500 font-mono">
                                                {(c.confidence_score * 100).toFixed(0)}% Match
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 italic">No specific candidates found.</div>
                        )}

                        <div className="pt-2 border-t border-white/5">
                            <p className="text-sm text-slate-400">
                                {plan.suggestion || "Should I link these tables based on the suggested columns?"}
                            </p>
                        </div>
                    </div>

                    {isRelationshipMode ? (
                        <div className="flex gap-3">
                            <button
                                onClick={relationshipCandidates.length ? handleApproveRelationships : undefined}
                                disabled={submitting}
                                className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-medium px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Yes, Link Them
                            </button>
                            <button
                                onClick={handleRejectRelationships}
                                disabled={submitting}
                                className="flex-1 bg-[#2a2929] hover:bg-[#333] border border-[#3e3d3d] text-slate-300 font-medium px-4 py-3 rounded-xl transition-all"
                            >
                                No
                            </button>
                        </div>
                    ) : (
                        <div className="text-sm text-slate-400">
                            Clarification is only supported for relationship linking right now.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

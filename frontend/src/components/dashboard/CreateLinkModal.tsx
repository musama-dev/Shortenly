import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { ChevronDown } from "../icons";
import { normalizeUrl, createLink, shortUrl, registerLink } from "../../lib/links";
import "./createlink.css";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateLinkModal({ open, onClose, onCreated }: Props) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expires, setExpires] = useState("never");
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = () => {
    const normalized = normalizeUrl(url);
    if (!normalized) { setError("Enter a valid URL"); return; }
    setSaving(true);
    window.setTimeout(() => {
      registerLink(createLink(normalized, { alias: alias || undefined }));
      setSaving(false);
      setUrl(""); setAlias(""); setError(null); setAdvanced(false);
      onCreated?.();
    }, 500);
  };

  return (
    <Modal open={open} onClose={onClose} title="Create a new link"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={submit}>{saving ? "Creating…" : "Create link"}</Button>
        </>
      }>
      <div className="create">
        <Input label="Destination URL" placeholder="https://example.com/very/long/path"
          value={url} error={error} autoFocus
          onChange={(e) => { setUrl(e.target.value); if (error) setError(null); }} />

        <button className="create__advanced" onClick={() => setAdvanced(!advanced)} aria-expanded={advanced}>
          Advanced options
          <ChevronDown width={14} height={14} style={{ transform: advanced ? "rotate(180deg)" : undefined }} />
        </button>

        {advanced && (
          <div className="create__advanced-body">
            <Input label="Custom alias" adornment="sho.rt/" placeholder="summer"
              value={alias} onChange={(e) => setAlias(e.target.value)}
              hint={alias ? `Will be available at ${shortUrl(alias)}` : "Leave empty for a random alias"} />
            <div className="field">
              <label className="field__label" htmlFor="expires">Expiration</label>
              <select id="expires" className="create__select" value={expires} onChange={(e) => setExpires(e.target.value)}>
                <option value="never">Never</option>
                <option value="7d">In 7 days</option>
                <option value="30d">In 30 days</option>
                <option value="custom">Custom date…</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

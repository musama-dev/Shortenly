import { useState } from "react";
import { useTheme } from "../../lib/theme";
import { Segmented } from "../../components/ui/misc";
import { Button } from "../../components/ui/Button";

type ThemeOpt = "light" | "dark" | "system";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="page__section">
      <h2 className="page__h2">{title}</h2>
      <div className="page__card settings">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="settings__row">
      <span className="settings__label">{label}</span>
      <div className="settings__control">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Settings</h1>
      </header>

      <Group title="Account">
        <Row label="Name"><span className="settings__value">Alex Kim</span></Row>
        <Row label="Email"><span className="settings__value">alex@example.com</span></Row>
      </Group>

      <Group title="Appearance">
        <Row label="Theme">
          <Segmented<ThemeOpt>
            value={theme}
            onChange={(t) => setTheme(t)}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
          />
        </Row>
      </Group>

      <Group title="Notifications">
        <Row label="Weekly digest">
          <button role="switch" aria-checked={notifications}
            className={`switch ${notifications ? "switch--on" : ""}`}
            onClick={() => setNotifications(!notifications)}>
            <span className="switch__knob" />
          </button>
        </Row>
      </Group>

      <Group title="API">
        <Row label="API key">
          <code className="settings__key">sk_live_••••••••••••••••4821</code>
        </Row>
        <Row label="Documentation">
          <a href="#" className="page__link">View docs</a>
        </Row>
      </Group>

      <Group title="Danger Zone">
        <Row label="Delete account">
          <Button variant="danger" size="sm">Delete account…</Button>
        </Row>
      </Group>
    </div>
  );
}

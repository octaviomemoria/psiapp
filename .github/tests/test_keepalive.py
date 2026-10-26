"""Exercise the actual workflow shell with fake curl; never contact Supabase."""

import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import textwrap
import unittest


WORKFLOW = Path(__file__).resolve().parents[1] / "workflows/supabase-keepalive.yml"
SCRIPT = textwrap.dedent(WORKFLOW.read_text(encoding="utf-8").split("        run: |\n", 1)[1])
BASH = shutil.which("bash")
if os.name == "nt":
    BASH = "C:/Program Files/Git/bin/bash.exe"

MOCK = r'''
curl() {
  printf '%s\n' "$*" >> "$MOCK_CALLS"
  case " $* " in
    *auth/v1/health*) printf '%s' "$MOCK_AUTH" ;;
    *)
      if [[ "$MOCK_REST" == transport ]]; then
        printf 000
        return 28
      fi
      printf '%s' "$MOCK_REST"
      ;;
  esac
}
'''


class KeepaliveTest(unittest.TestCase):
    def run_ping(self, rest, auth="200", key="fake-key"):
        with tempfile.TemporaryDirectory() as folder:
            calls_file = Path(folder) / "calls.txt"
            env = dict(os.environ, SUPABASE_URL="https://example.invalid/",
                       SUPABASE_KEY=key, MOCK_REST=rest, MOCK_AUTH=auth,
                       MOCK_CALLS=calls_file.as_posix())
            result = subprocess.run(
                [BASH, "--noprofile", "--norc", "-e", "-o", "pipefail", "-c", MOCK + SCRIPT],
                cwd=folder, env=env, capture_output=True, text=True, timeout=10,
            )
            calls = calls_file.read_text().splitlines() if calls_file.exists() else []
        return result, calls

    def test_rest_success_does_not_call_auth(self):
        for status in ("200", "204"):
            with self.subTest(status=status):
                result, calls = self.run_ping(status, auth="503")
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(len(calls), 1)
                self.assertIn("--max-time 15", calls[0])
                self.assertIn("--retry 2", calls[0])
                self.assertIn("https://example.invalid/rest/v1/", calls[0])

    def test_auth_success_does_not_hide_rest_failure(self):
        for status in ("302", "401", "503", "transport"):
            with self.subTest(status=status):
                result, calls = self.run_ping(status)
                self.assertEqual(result.returncode, 1, result.stderr)
                self.assertEqual(len(calls), 2)
                self.assertIn("--max-time 15", calls[1])

    def test_both_endpoints_fail(self):
        result, calls = self.run_ping("503", auth="503")
        self.assertEqual(result.returncode, 1)
        self.assertEqual(len(calls), 2)

    def test_missing_credentials_fail_before_http(self):
        result, calls = self.run_ping("200", key="")
        self.assertEqual(result.returncode, 1)
        self.assertEqual(calls, [])


if __name__ == "__main__":
    unittest.main()

using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

class Launcher {
    [STAThread]
    static void Main() {
        try {
            string currentDir = AppDomain.CurrentDomain.BaseDirectory;
            string htmlPath = Path.Combine(currentDir, "index.html");
            
            if (!File.Exists(htmlPath)) {
                MessageBox.Show("index.html 파일을 찾을 수 없습니다. 프로그램과 같은 폴더에 있는지 확인해주세요.", "오류", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            // Launch Edge in App Mode (Dedicated window without browser UI)
            ProcessStartInfo startInfo = new ProcessStartInfo();
            startInfo.FileName = "msedge.exe";
            startInfo.Arguments = "--app=\"file://" + htmlPath + "\"";
            startInfo.UseShellExecute = true;
            
            Process.Start(startInfo);
        } catch (Exception ex) {
            MessageBox.Show("프로그램 실행 중 오류가 발생했습니다: " + ex.Message, "오류", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}

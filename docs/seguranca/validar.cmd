@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0..\.."
set PYTHONUTF8=1
if not exist "docs\seguranca\depois" mkdir "docs\seguranca\depois"
semgrep --version > "docs\seguranca\depois\versao.txt" 2>&1
if errorlevel 1 (
  echo Nao foi possivel executar o Semgrep. Abra um novo terminal e confira o PATH.
  exit /b 1
)
echo Executando Semgrep. Aguarde a conclusao...
semgrep scan --config p/security-audit --config p/owasp-top-ten --config p/secrets --metrics=off --exclude "node_modules" --exclude "dist" --exclude "docs/seguranca" --exclude "outputs" --json-output docs/seguranca/depois/resultado.json . > "docs\seguranca\depois\execucao.txt" 2>&1
set "scanExit=%ERRORLEVEL%"
type "docs\seguranca\depois\execucao.txt"
echo.
echo Codigo de saida: %scanExit%
echo Evidencias salvas em docs\seguranca\depois.
exit /b %scanExit%

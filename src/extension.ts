import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Ensure that a valid workspace folder is open
function getWorkspacePath(): string | undefined {
    const folders = vscode.workspace.workspaceFolders;
    if (folders && folders.length > 0) {
        return folders[0].uri.fsPath; // Returns the path of the first workspace folder
    } else {
        vscode.window.showErrorMessage('No workspace folder is open.');
        return undefined;
    }
}

// Path to store the streak data
function getStreakFilePath(): string | undefined {
    const workspacePath = getWorkspacePath();
    if (workspacePath) {
        const streakFolder = path.join(workspacePath, '.vscode');
        const streakFile = path.join(streakFolder, 'codeStreak.json');
        return streakFile;
    }
    return undefined;
}

// Function to create the folder and file if they don't exist
function ensureStreakFileExists() {
    const streakFile = getStreakFilePath();
    if (!streakFile) return;

    const streakFolder = path.dirname(streakFile);

    // Check if the folder exists; if not, create it
    if (!fs.existsSync(streakFolder)) {
        try {
            fs.mkdirSync(streakFolder, { recursive: true });
        } catch (err) {
            if (err instanceof Error) {
                vscode.window.showErrorMessage(`Error creating folder: ${err.message}`);
            } else {
                vscode.window.showErrorMessage('Unknown error occurred while creating folder.');
            }
        }
    }

    // Check if the file exists; if not, create it
    if (!fs.existsSync(streakFile)) {
        const initialData = { lastCoded: '', streak: 0 };
        fs.writeFileSync(streakFile, JSON.stringify(initialData), 'utf-8');
    }
}

// Function to read the streak data
function getStreakData(): { lastCoded: string; streak: number } {
    const streakFile = getStreakFilePath();
    if (!streakFile) return { lastCoded: '', streak: 0 };

    ensureStreakFileExists(); // Ensure the folder and file exist before reading

    const data = fs.readFileSync(streakFile, 'utf-8');
    return JSON.parse(data);
}

// Function to save the streak data
function saveStreakData(lastCoded: string, streak: number) {
    const streakFile = getStreakFilePath();
    if (!streakFile) return;

    const data = { lastCoded, streak };
    fs.writeFileSync(streakFile, JSON.stringify(data), 'utf-8');
}

// Activate function called when VS Code is opened
export function activate(context: vscode.ExtensionContext) {
    const currentDate = new Date().toLocaleDateString();

    // Load existing streak data
    const streakData = getStreakData();

    // Check if user coded today
    if (streakData.lastCoded === currentDate) {
        vscode.window.showInformationMessage(`You've already coded today! Keep it up!`);
    } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toLocaleDateString();

        let newStreak = streakData.streak;

        // Check if the last coded day was yesterday to continue streak
        if (streakData.lastCoded === yesterdayString) {
            newStreak++;
            vscode.window.showInformationMessage(`Great job! You've coded for ${newStreak} days in a row!`);
        } else {
            newStreak = 1;
            vscode.window.showInformationMessage(`Start fresh! You've coded today, keep the streak going!`);
        }

        // Update streak data
        saveStreakData(currentDate, newStreak);
    }

    console.log('Code Streak Tracker is now active.');
}

// Deactivate function
export function deactivate() {}

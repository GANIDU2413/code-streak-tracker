import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Path to store the streak data
const streakFolder = path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', '.vscode');
const streakFile = path.join(streakFolder, 'codeStreak.json');

// Function to create the folder and file if they don't exist
function ensureStreakFileExists() {
    if (!fs.existsSync(streakFolder)) {
        fs.mkdirSync(streakFolder, { recursive: true });
    }

    if (!fs.existsSync(streakFile)) {
        const initialData = { lastCoded: '', streak: 0 };
        fs.writeFileSync(streakFile, JSON.stringify(initialData), 'utf-8');
    }
}

// Function to read the streak data
function getStreakData(): { lastCoded: string; streak: number } {
    ensureStreakFileExists(); // Ensure file exists before reading
    const data = fs.readFileSync(streakFile, 'utf-8');
    return JSON.parse(data);
}

// Function to save the streak data
function saveStreakData(lastCoded: string, streak: number) {
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

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Path to store the streak data
const streakFile = path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', '.vscode', 'codeStreak.json');

// Function to read the streak data
function getStreakData(): { lastCoded: string; streak: number } {
    if (fs.existsSync(streakFile)) {
        const data = fs.readFileSync(streakFile, 'utf-8');
        return JSON.parse(data);
    }
    return { lastCoded: '', streak: 0 };
}

// Function to save the streak data
function saveStreakData(lastCoded: string, streak: number) {
    const data = { lastCoded, streak };
    fs.writeFileSync(streakFile, JSON.stringify(data), 'utf-8');
}

let statusBarItem: vscode.StatusBarItem;

// Activate function called when VS Code is opened
export function activate(context: vscode.ExtensionContext) {
    const currentDate = new Date().toLocaleDateString();

    // Create a status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.tooltip = "Your current coding streak!";
    statusBarItem.show();

    // Load existing streak data
    const streakData = getStreakData();

    // Check if user coded today
    if (streakData.lastCoded === currentDate) {
        vscode.window.showInformationMessage(`You've already coded today! Keep it up!`);
        updateStatusBar(streakData.streak);
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
        updateStatusBar(newStreak);
    }

    console.log('Code Streak Tracker is now active.');
}

// Function to update the status bar item
function updateStatusBar(streak: number) {
    statusBarItem.text = `🔥 Coding Streak: ${streak} days`;
    statusBarItem.show();
}

// Deactivate function
export function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}

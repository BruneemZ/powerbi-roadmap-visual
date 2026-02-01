import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import powerbi from "powerbi-visuals-api";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

/**
 * Paramètres de la roadmap
 */
class RoadmapSettingsCard extends FormattingSettingsCard {
    barHeight = new formattingSettings.NumUpDown({
        name: "barHeight",
        displayName: "Hauteur des barres",
        value: 30,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 20,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 100,
            }
        }
    });

    showGrid = new formattingSettings.ToggleSwitch({
        name: "showGrid",
        displayName: "Afficher la grille",
        value: true
    });

    name: string = "roadmapSettings";
    displayName: string = "Paramètres Roadmap";
    slices: Array<FormattingSettingsSlice> = [this.barHeight, this.showGrid];
}

/**
 * Modèle de paramètres du visuel
 */
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    roadmapSettings = new RoadmapSettingsCard();
    cards = [this.roadmapSettings];
}

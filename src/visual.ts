import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "./settings";
import * as d3 from "d3";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;

export interface RoadmapDataPoint {
    task: string;
    startDate: Date;
    endDate: Date;
    category: string;
    progress: number;
}

export class Visual implements IVisual {
    private target: HTMLElement;
    private svg: d3.Selection<SVGElement, any, any, any>;
    private container: d3.Selection<SVGGElement, any, any, any>;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private dataPoints: RoadmapDataPoint[];

    constructor(options: VisualConstructorOptions) {
        this.formattingSettingsService = new FormattingSettingsService();
        this.target = options.element;

        // Créer l'élément SVG principal
        this.svg = d3.select(this.target)
            .append("svg")
            .classed("roadmap-svg", true);

        this.container = this.svg
            .append("g")
            .classed("roadmap-container", true);
    }

    public update(options: VisualUpdateOptions): void {
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
            VisualFormattingSettingsModel,
            options.dataViews[0]
        );

        // Récupérer les dimensions
        const width = options.viewport.width;
        const height = options.viewport.height;

        this.svg
            .attr("width", width)
            .attr("height", height);

        // Traiter les données
        this.dataPoints = this.transformData(options.dataViews[0]);

        if (!this.dataPoints || this.dataPoints.length === 0) {
            this.renderEmptyState(width, height);
            return;
        }

        this.renderRoadmap(width, height);
    }

    private transformData(dataView: DataView): RoadmapDataPoint[] {
        if (!dataView ||
            !dataView.table ||
            !dataView.table.rows ||
            dataView.table.rows.length === 0) {
            return [];
        }

        const table = dataView.table;
        const rows = table.rows;
        const dataPoints: RoadmapDataPoint[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            dataPoints.push({
                task: row[0] ? row[0].toString() : `Tâche ${i + 1}`,
                startDate: row[1] ? new Date(row[1].toString()) : new Date(),
                endDate: row[2] ? new Date(row[2].toString()) : new Date(),
                category: row[3] ? row[3].toString() : "Défaut",
                progress: row[4] ? Number(row[4]) : 0
            });
        }

        return dataPoints;
    }

    private renderRoadmap(width: number, height: number): void {
        const margin = { top: 50, right: 30, bottom: 50, left: 200 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const barHeight = this.formattingSettings.roadmapSettings.barHeight.value;
        const showGrid = this.formattingSettings.roadmapSettings.showGrid.value;

        // Créer les échelles
        const minDate = d3.min(this.dataPoints, d => d.startDate);
        const maxDate = d3.max(this.dataPoints, d => d.endDate);

        const xScale = d3.scaleTime()
            .domain([minDate, maxDate])
            .range([0, innerWidth]);

        const yScale = d3.scaleBand()
            .domain(this.dataPoints.map(d => d.task))
            .range([0, innerHeight])
            .padding(0.2);

        // Couleurs par catégorie
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
            .domain([...new Set(this.dataPoints.map(d => d.category))]);

        // Nettoyer le conteneur
        this.container.selectAll("*").remove();

        // Positionner le conteneur
        this.container.attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Ajouter la grille si activée
        if (showGrid) {
            this.container.append("g")
                .attr("class", "grid")
                .selectAll("line")
                .data(xScale.ticks())
                .enter()
                .append("line")
                .attr("x1", d => xScale(d))
                .attr("x2", d => xScale(d))
                .attr("y1", 0)
                .attr("y2", innerHeight)
                .attr("stroke", "#e0e0e0")
                .attr("stroke-dasharray", "2,2");
        }

        // Dessiner les barres de tâches
        const tasks = this.container.append("g")
            .attr("class", "tasks")
            .selectAll("g")
            .data(this.dataPoints)
            .enter()
            .append("g")
            .attr("class", "task");

        // Barre de fond (durée totale)
        tasks.append("rect")
            .attr("class", "task-background")
            .attr("x", d => xScale(d.startDate))
            .attr("y", d => yScale(d.task))
            .attr("width", d => xScale(d.endDate) - xScale(d.startDate))
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScale(d.category))
            .attr("opacity", 0.3)
            .attr("rx", 3);

        // Barre de progression
        tasks.append("rect")
            .attr("class", "task-progress")
            .attr("x", d => xScale(d.startDate))
            .attr("y", d => yScale(d.task))
            .attr("width", d => (xScale(d.endDate) - xScale(d.startDate)) * (d.progress / 100))
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScale(d.category))
            .attr("rx", 3);

        // Ajouter un titre (tooltip natif SVG) pour chaque tâche
        tasks.append("title")
            .text(d => {
                const startStr = d.startDate.toLocaleDateString('fr-FR');
                const endStr = d.endDate.toLocaleDateString('fr-FR');
                const duration = Math.ceil((d.endDate.getTime() - d.startDate.getTime()) / (1000 * 60 * 60 * 24));
                return `${d.task}\n` +
                       `Catégorie: ${d.category}\n` +
                       `Début: ${startStr}\n` +
                       `Fin: ${endStr}\n` +
                       `Durée: ${duration} jours\n` +
                       `Progression: ${d.progress}%`;
            });

        // Texte des tâches
        tasks.append("text")
            .attr("x", -10)
            .attr("y", d => yScale(d.task) + yScale.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .attr("fill", "#333")
            .attr("font-size", "12px")
            .text(d => d.task);

        // Axe des dates
        const xAxis = d3.axisBottom(xScale)
            .ticks(6)
            .tickFormat(d3.timeFormat("%b %Y"));

        this.container.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(xAxis)
            .selectAll("text")
            .attr("font-size", "10px");

        // Légende (catégories)
        const categories = [...new Set(this.dataPoints.map(d => d.category))];
        const legend = this.container.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${innerWidth - 100}, -30)`);

        legend.selectAll("rect")
            .data(categories)
            .enter()
            .append("rect")
            .attr("x", (d, i) => i * 100)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", d => colorScale(d));

        legend.selectAll("text")
            .data(categories)
            .enter()
            .append("text")
            .attr("x", (d, i) => i * 100 + 20)
            .attr("y", 12)
            .attr("font-size", "10px")
            .text(d => d);
    }

    private renderEmptyState(width: number, height: number): void {
        this.container.selectAll("*").remove();

        this.container.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("fill", "#666")
            .text("Ajoutez des données pour afficher la roadmap");
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}

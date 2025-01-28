
import { AfterViewInit, Component, ViewChild, ElementRef } from '@angular/core';
import { EChartsOption, init, ECharts } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
selector: 'app-line-chart',
standalone: true,
imports: [NgxEchartsModule],
templateUrl: './line-chart.component.html',
styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements AfterViewInit { @ViewChild('lineChart') lineChart!: ElementRef;
  chartInstance!: ECharts;

  lineChartOptions: EChartsOption = {
    title: {
      text: '',
      left: 'center',
      top: '5%',
      textStyle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#ccc',
      borderWidth: 1,
      textStyle: {
        color: '#333',
      },
    },
    legend: {
      data: ['Productivity'], // Specify the legend item name(s)
      left: 'center',          // Adjust the legend position
      top: '10%',              // Adjust the vertical position
      textStyle: {
        color: '#333',         // Color of the legend text
      },
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      axisLine: { lineStyle: { color: '#ccc' } },
      axisLabel: { color: '#666' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#ccc' } },
      axisLabel: { color: '#666' },
    },
    series: [
      {
        name: 'Productivity', // Add name for legend
        data: [70, 75, 80, 85, 90],
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 4,
          color: '#42a5f5',
        },
        itemStyle: {
          color: '#42a5f5',
          borderWidth: 2,
          borderColor: '#fff',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#42a5f5' },
              { offset: 1, color: 'rgba(66, 165, 245, 0.1)' },
            ],
          },
        },
      },
    ],
  };

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.lineChart && this.lineChart.nativeElement) {
        this.initializeChart();
      } else {
        console.warn('Chart container dimensions are not set properly.');
      }
    });
  }

  initializeChart() {
    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
    this.chartInstance = init(this.lineChart.nativeElement);
    this.chartInstance.setOption(this.lineChartOptions);
  }
}

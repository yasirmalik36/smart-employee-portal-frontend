
import { AfterViewInit, Component, ViewChild, ElementRef } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
selector: 'app-donut-chart',
standalone: true,
imports: [NgxEchartsModule],
templateUrl: './donut-chart.component.html',
})
export class DonutChartComponent implements AfterViewInit {
@ViewChild('donutChart') donutChart!: ElementRef;

// Donut Chart configuration
donutChartOptions: EChartsOption = {
  title: {
    text: '',
    subtext: '90%',
    left: 'center',
    top: '5%',
    textStyle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
    },
  },
  legend: {
    orient: 'horizontal',
    itemGap: 20,
    textStyle: {
      fontSize: 14,
      color: '#666',
    },
    data: [
      { name: 'Present', icon: 'circle', textStyle: { color: '#42a5f5' } },
      { name: 'Absent', icon: 'circle', textStyle: { color: '#ffb74d' } },
    ],
  },
  series: [
    {
      name: 'Attendance Rate',
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'center',
        formatter: '{b}\n{c}%',
        fontSize: 20,
        color: '#333',
      },
      emphasis: {
        label: {
          fontSize: 24,
          fontWeight: 'bold',
        },
      },
      data: [
        { value: 90, name: 'Present' },
        { value: 10, name: 'Absent' },
      ],
      itemStyle: {
        borderRadius: 12,
        borderColor: '#fff',
        borderWidth: 2,
      },
      color: ['#42a5f5', '#ffb74d'],
    },
  ],
};



ngAfterViewInit() {
setTimeout(() => {
if (this.donutChart && this.donutChart.nativeElement) {
// Initialize the chart here
} else {
console.warn('Chart container dimensions are not set properly.');
}
});
}
}
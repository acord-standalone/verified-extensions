(function(c,a,d){"use strict";const h="\u{E01F0}";var l={load(){c.subscriptions.push(d.patcher.instead(a.MessageActions,"sendMessage",(n,i)=>{const[u,t]=n,r=c.persist.ghost?.settings?.badwords?.split(",").map(o=>o.trim());if(!r?.length)return i(...n);let e=t.content.split(" ");return t.content&&t.content.length<1e3&&r.forEach(o=>{t.content.length<2e3&&(e=e.map(s=>s.toLowerCase()===o.toLowerCase()?s.split("").join(h):s))}),t.content=e.join(" "),n[1]=t,i(...n)}))},unload(){}};return l})($acord.extension,$acord.modules.common,$acord);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc3Vic2NyaXB0aW9ucywgcGVyc2lzdCB9IGZyb20gXCJAYWNvcmQvZXh0ZW5zaW9uXCI7XHJcbmltcG9ydCB7IE1lc3NhZ2VBY3Rpb25zIH0gZnJvbSBcIkBhY29yZC9tb2R1bGVzL2NvbW1vblwiO1xyXG5pbXBvcnQgeyBwYXRjaGVyIH0gZnJvbSBcIkBhY29yZFwiO1xyXG5cclxuY29uc3Qgbm9DaGFyQ2hhciA9ICfzoIewJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICBsb2FkKCkge1xyXG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKFxyXG4gICAgICBwYXRjaGVyLmluc3RlYWQoTWVzc2FnZUFjdGlvbnMsIFwic2VuZE1lc3NhZ2VcIiwgKGFyZ3MsIG9yaWdpbmFsKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IFtjaGFubmVsSWQsIG1lc3NhZ2VdID0gYXJncztcclxuICBcclxuICAgICAgICBjb25zdCB3b3JkcyA9IHBlcnNpc3QuZ2hvc3Q/LnNldHRpbmdzPy5iYWR3b3Jkcz8uc3BsaXQoYCxgKS5tYXAod29yZCA9PiB3b3JkLnRyaW0oKSk7XHJcbiAgXHJcbiAgICAgICAgaWYgKCF3b3Jkcz8ubGVuZ3RoKSByZXR1cm4gb3JpZ2luYWwoLi4uYXJncyk7XHJcbiAgXHJcbiAgICAgICAgbGV0IGNvbnRlbnQgPSBtZXNzYWdlLmNvbnRlbnQuc3BsaXQoXCIgXCIpO1xyXG4gIFxyXG4gICAgICAgIGlmIChtZXNzYWdlLmNvbnRlbnQgJiYgbWVzc2FnZS5jb250ZW50Lmxlbmd0aCA8IDEwMDApIHtcclxuICAgICAgICAgIHdvcmRzLmZvckVhY2god29yZCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLmNvbnRlbnQubGVuZ3RoIDwgMjAwMCkge1xyXG4gICAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50Lm1hcChwYXJ0ID0+IHBhcnQudG9Mb3dlckNhc2UoKSA9PT0gd29yZC50b0xvd2VyQ2FzZSgpID8gcGFydC5zcGxpdCgnJykuam9pbihub0NoYXJDaGFyKSA6IHBhcnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgbWVzc2FnZS5jb250ZW50ID0gY29udGVudC5qb2luKCcgJyk7XHJcbiAgICAgICAgYXJnc1sxXSA9IG1lc3NhZ2U7XHJcbiAgXHJcbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsKC4uLmFyZ3MpO1xyXG4gICAgICB9KVxyXG4gICAgKVxyXG4gIH0sXHJcbiAgdW5sb2FkKCkge31cclxufSJdLCJuYW1lcyI6WyJzdWJzY3JpcHRpb25zIiwicGF0Y2hlciIsIk1lc3NhZ2VBY3Rpb25zIiwicGVyc2lzdCJdLCJtYXBwaW5ncyI6ImdEQUdBLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQztBQUMvQixZQUFlO0FBQ2YsRUFBRSxJQUFJLEdBQUc7QUFDVCxJQUFJQSx1QkFBYSxDQUFDLElBQUk7QUFDdEIsTUFBTUMsY0FBTyxDQUFDLE9BQU8sQ0FBQ0MscUJBQWMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxLQUFLO0FBQ3pFLFFBQVEsTUFBTSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDMUMsUUFBUSxNQUFNLEtBQUssR0FBR0MsaUJBQU8sQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUMvRixRQUFRLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTTtBQUMxQixVQUFVLE9BQU8sUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDbkMsUUFBUSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqRCxRQUFRLElBQUksT0FBTyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7QUFDN0QsVUFBVSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxLQUFLO0FBQ2xDLFlBQVksSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7QUFDOUMsY0FBYyxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ2xJLGFBQWE7QUFDYixXQUFXLENBQUMsQ0FBQztBQUNiLFNBQVM7QUFDVCxRQUFRLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM1QyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUM7QUFDMUIsUUFBUSxPQUFPLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ2pDLE9BQU8sQ0FBQztBQUNSLEtBQUssQ0FBQztBQUNOLEdBQUc7QUFDSCxFQUFFLE1BQU0sR0FBRztBQUNYLEdBQUc7QUFDSCxDQUFDIn0=

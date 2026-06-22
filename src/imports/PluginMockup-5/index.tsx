import svgPaths from "./svg-1x7g1bhbgp";

function Container3() {
  return <div className="bg-[#ff5f57] relative rounded-[33554400px] shrink-0 size-[12px]" data-name="Container" />;
}

function Container4() {
  return <div className="bg-[#ffbd2e] relative rounded-[33554400px] shrink-0 size-[12px]" data-name="Container" />;
}

function Container5() {
  return <div className="bg-[#28c840] relative rounded-[33554400px] shrink-0 size-[12px]" data-name="Container" />;
}

function Container2() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[6px] items-center relative size-full">
        <Container3 />
        <Container4 />
        <Container5 />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[9px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 9">
        <g clipPath="url(#clip0_9_5195)" id="Icon">
          <path d={svgPaths.p3542e280} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
          <path d={svgPaths.p15348c00} id="Vector_2" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
          <path d={svgPaths.p3defb690} id="Vector_3" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
        </g>
        <defs>
          <clipPath id="clip0_9_5195">
            <rect fill="white" height="9" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container7() {
  return (
    <div className="bg-[#0c0c0d] relative rounded-[4px] shrink-0 size-[14px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon />
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[74.625px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[16.5px] left-0 text-[11px] text-[rgba(12,12,13,0.7)] top-0 whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
          DS Boilerplate
        </p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="flex-[182.203_0_0] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[6px] items-center justify-center relative size-full">
        <Container7 />
        <Text />
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[13.5px] relative shrink-0 w-[19.797px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Consolas:Regular',sans-serif] leading-[13.5px] left-0 not-italic text-[#6e6e80] text-[9px] top-0 whitespace-nowrap">v0.1</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center pb-[13px] pt-[12px] px-[16px] relative size-full">
          <Container2 />
          <Container6 />
          <Text1 />
        </div>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="bg-[#f7f7f8] relative rounded-tl-[16px] rounded-tr-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0.08)] border-b border-solid inset-0 pointer-events-none rounded-tl-[16px] rounded-tr-[16px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-px relative size-full">
        <Container1 />
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[16px] relative shrink-0 w-[14px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-[2px] relative size-full">
        <p className="[word-break:break-word] font-['Material_Symbols_Outlined:Regular',sans-serif] font-normal leading-[14px] relative shrink-0 text-[#5e6ad2] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"FILL" 0, "GRAD" 0' }}>
          palette
        </p>
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[15px] relative shrink-0 w-[30.781px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[15px] left-[15.5px] text-[#5e6ad2] text-[10px] text-center top-0 whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
          Colors
        </p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="flex-[99.328_0_0] h-[51px] min-w-px relative" data-name="Button">
      <div aria-hidden className="absolute border-[#5e6ad2] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center pb-[12px] pt-[8px] relative size-full">
        <Text2 />
        <Text3 />
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[16px] relative shrink-0 w-[14px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-[2px] relative size-full">
        <p className="[word-break:break-word] font-['Material_Symbols_Outlined:Regular',sans-serif] font-normal leading-[14px] relative shrink-0 text-[#6e6e80] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"FILL" 0, "GRAD" 0' }}>
          font_download
        </p>
      </div>
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[15px] relative shrink-0 w-[56.344px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[15px] left-[28.5px] text-[#6e6e80] text-[10px] text-center top-0 whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
          Typography
        </p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="flex-[99.344_0_0] h-[51px] min-w-px relative" data-name="Button">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0)] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center pb-[12px] pt-[8px] relative size-full">
        <Text4 />
        <Text5 />
      </div>
    </div>
  );
}

function Text6() {
  return (
    <div className="h-[16px] relative shrink-0 w-[14px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pb-[2px] relative size-full">
        <p className="[word-break:break-word] font-['Material_Symbols_Outlined:Regular',sans-serif] font-normal leading-[14px] relative shrink-0 text-[#6e6e80] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"FILL" 0, "GRAD" 0' }}>
          grid_4x4
        </p>
      </div>
    </div>
  );
}

function Text7() {
  return (
    <div className="h-[15px] relative shrink-0 w-[32.266px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[15px] left-[16.5px] text-[#6e6e80] text-[10px] text-center top-0 whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
          Layout
        </p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="flex-[99.328_0_0] h-[51px] min-w-px relative" data-name="Button">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0)] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center pb-[12px] pt-[8px] relative size-full">
        <Text6 />
        <Text7 />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0.08)] border-b border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start pb-px relative size-full">
        <Button />
        <Button1 />
        <Button2 />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[10px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
        <g clipPath="url(#clip0_9_5191)" id="Icon">
          <path d={svgPaths.p1e4f3d00} id="Vector" stroke="var(--stroke-0, #6E6E80)" strokeWidth="0.9375" />
          <path d="M6.5625 6.5625L8.75 8.75" id="Vector_2" stroke="var(--stroke-0, #6E6E80)" strokeLinecap="round" strokeWidth="0.9375" />
        </g>
        <defs>
          <clipPath id="clip0_9_5191">
            <rect fill="white" height="10" width="10" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text8() {
  return (
    <div className="h-[15px] relative shrink-0 w-[71.734px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['DM_Sans:9pt_Regular',sans-serif] font-normal leading-[15px] left-0 text-[#6e6e80] text-[10px] top-0 whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 9' }}>
          Search tokens…
        </p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="bg-[#f2f2f4] h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[10px] py-[6px] relative size-full">
          <Icon1 />
          <Text8 />
        </div>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start p-[12px] relative size-full">
        <Container11 />
      </div>
    </div>
  );
}

function Text9() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="[word-break:break-word] font-['Material_Symbols_Outlined:Regular',sans-serif] font-normal leading-[13px] relative shrink-0 text-[#5e6ad2] text-[13px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"FILL" 0, "GRAD" 0' }}>
          palette
        </p>
      </div>
    </div>
  );
}

function Text10() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[15px] relative shrink-0 text-[#5e6ad2] text-[10px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
          Palette
        </p>
      </div>
    </div>
  );
}

function Text11() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="[word-break:break-word] font-['Material_Symbols_Outlined:Regular',sans-serif] font-normal leading-[14px] relative shrink-0 text-[#5e6ad2] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"FILL" 0, "GRAD" 0' }}>
          expand_less
        </p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Button">
      <div aria-hidden className="absolute border-[#eee6e6] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center pb-[10px] pt-[9px] px-[12px] relative size-full">
          <Text9 />
          <Text10 />
          <Text11 />
        </div>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="bg-[#05061a] relative rounded-[4px] shrink-0 size-[24px]" data-name="Container">
      <div aria-hidden className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Text12() {
  return (
    <div className="h-[15px] relative shrink-0 w-[71.484px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Consolas:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#0c0c0d] text-[10px] top-[-1px] whitespace-nowrap">MidnightDepth</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[40px] min-h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-center min-h-[inherit] px-[8px] py-[6px] relative size-full">
          <Container15 />
          <Text12 />
        </div>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="bg-[#090c2e] relative rounded-[4px] shrink-0 size-[24px]" data-name="Container">
      <div aria-hidden className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Text13() {
  return (
    <div className="h-[15px] relative shrink-0 w-[93.469px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Consolas:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#0c0c0d] text-[10px] top-[-1px] whitespace-nowrap">MidnightDepth-900</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[40px] min-h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-center min-h-[inherit] px-[8px] py-[6px] relative size-full">
          <Container17 />
          <Text13 />
        </div>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="bg-[#141852] relative rounded-[4px] shrink-0 size-[24px]" data-name="Container">
      <div aria-hidden className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Text14() {
  return (
    <div className="h-[15px] relative shrink-0 w-[93.469px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Consolas:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#0c0c0d] text-[10px] top-[-1px] whitespace-nowrap">MidnightDepth-800</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[40px] min-h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-center min-h-[inherit] px-[8px] py-[6px] relative size-full">
          <Container19 />
          <Text14 />
        </div>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="bg-[#1e2270] relative rounded-[4px] shrink-0 size-[24px]" data-name="Container">
      <div aria-hidden className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Text15() {
  return (
    <div className="h-[15px] relative shrink-0 w-[93.469px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Consolas:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#0c0c0d] text-[10px] top-[-1px] whitespace-nowrap">MidnightDepth-700</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[40px] min-h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-center min-h-[inherit] px-[8px] py-[6px] relative size-full">
          <Container21 />
          <Text15 />
        </div>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="bg-[#2d328e] relative rounded-[4px] shrink-0 size-[24px]" data-name="Container">
      <div aria-hidden className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Text16() {
  return (
    <div className="h-[15px] relative shrink-0 w-[93.469px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Consolas:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#0c0c0d] text-[10px] top-[-1px] whitespace-nowrap">MidnightDepth-600</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[40px] min-h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-center min-h-[inherit] px-[8px] py-[6px] relative size-full">
          <Container23 />
          <Text16 />
        </div>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="bg-[#5e6ad2] relative rounded-[4px] shrink-0 size-[24px]" data-name="Container">
      <div aria-hidden className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Text17() {
  return (
    <div className="h-[15px] relative shrink-0 w-[93.469px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Consolas:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#0c0c0d] text-[10px] top-[-1px] whitespace-nowrap">MidnightDepth-500</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="h-[40px] min-h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-center min-h-[inherit] px-[8px] py-[6px] relative size-full">
          <Container25 />
          <Text17 />
        </div>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="bg-[#8b94e0] relative rounded-[4px] shrink-0 size-[24px]" data-name="Container">
      <div aria-hidden className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Text18() {
  return (
    <div className="h-[15px] relative shrink-0 w-[93.469px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Consolas:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#0c0c0d] text-[10px] top-[-1px] whitespace-nowrap">MidnightDepth-400</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[40px] min-h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-center min-h-[inherit] px-[8px] py-[6px] relative size-full">
          <Container27 />
          <Text18 />
        </div>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="bg-[#b3bcea] relative rounded-[4px] shrink-0 size-[24px]" data-name="Container">
      <div aria-hidden className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Text19() {
  return (
    <div className="h-[15px] relative shrink-0 w-[93.469px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Consolas:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#0c0c0d] text-[10px] top-[-1px] whitespace-nowrap">MidnightDepth-300</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="h-[40px] min-h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-center min-h-[inherit] px-[8px] py-[6px] relative size-full">
          <Container29 />
          <Text19 />
        </div>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="bg-[#d5d9f3] relative rounded-[4px] shrink-0 size-[24px]" data-name="Container">
      <div aria-hidden className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Text20() {
  return (
    <div className="h-[15px] relative shrink-0 w-[93.469px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Consolas:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#0c0c0d] text-[10px] top-[-1px] whitespace-nowrap">MidnightDepth-200</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[40px] min-h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-center min-h-[inherit] px-[8px] py-[6px] relative size-full">
          <Container31 />
          <Text20 />
        </div>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="bg-[#eceef9] relative rounded-[4px] shrink-0 size-[24px]" data-name="Container">
      <div aria-hidden className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Text21() {
  return (
    <div className="h-[15px] relative shrink-0 w-[93.469px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Consolas:Regular',sans-serif] leading-[15px] left-0 not-italic text-[#0c0c0d] text-[10px] top-[-1px] whitespace-nowrap">MidnightDepth-100</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="h-[40px] min-h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-center min-h-[inherit] px-[8px] py-[6px] relative size-full">
          <Container33 />
          <Text21 />
        </div>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[168px] max-h-[168px] relative shrink-0 w-full" data-name="Container">
      <div className="max-h-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start max-h-[inherit] pb-[8px] px-[12px] relative size-full">
          <Container14 />
          <Container16 />
          <Container18 />
          <Container20 />
          <Container22 />
          <Container24 />
          <Container26 />
          <Container28 />
          <Container30 />
          <Container32 />
        </div>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="bg-[#fafafa] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Button3 />
        <Container13 />
      </div>
    </div>
  );
}

function Text22() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="[word-break:break-word] font-['Material_Symbols_Outlined:Regular',sans-serif] font-normal leading-[13px] relative shrink-0 text-[#6e6e80] text-[13px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"FILL" 0, "GRAD" 0' }}>
          gradient
        </p>
      </div>
    </div>
  );
}

function Text23() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[15px] relative shrink-0 text-[#6e6e80] text-[10px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
          Semantic
        </p>
      </div>
    </div>
  );
}

function Text24() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="[word-break:break-word] font-['Material_Symbols_Outlined:Regular',sans-serif] font-normal leading-[14px] relative shrink-0 text-[#6e6e80] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"FILL" 0, "GRAD" 0' }}>
          expand_more
        </p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[#fafafa] h-[48px] relative shrink-0 w-[298px]" data-name="Button">
      <div aria-hidden className="absolute border-[#eee6e6] border-solid border-t inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center pb-[10px] pt-[9px] px-[12px] relative size-full">
        <Text22 />
        <Text23 />
        <Text24 />
      </div>
    </div>
  );
}

function Text25() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="[word-break:break-word] font-['Material_Symbols_Outlined:Regular',sans-serif] font-normal leading-[13px] relative shrink-0 text-[#6e6e80] text-[13px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"FILL" 0, "GRAD" 0' }}>
          diamond
        </p>
      </div>
    </div>
  );
}

function Text26() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[15px] relative shrink-0 text-[#6e6e80] text-[10px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
          Tokens
        </p>
      </div>
    </div>
  );
}

function Text27() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <p className="[word-break:break-word] font-['Material_Symbols_Outlined:Regular',sans-serif] font-normal leading-[14px] relative shrink-0 text-[#6e6e80] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"FILL" 0, "GRAD" 0' }}>
          expand_more
        </p>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-[#fafafa] h-[48px] relative shrink-0 w-[298px]" data-name="Button">
      <div aria-hidden className="absolute border-[#eee6e6] border-solid border-t inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center pb-[10px] pt-[9px] px-[12px] relative size-full">
        <Text25 />
        <Text26 />
        <Text27 />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="bg-white relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container10 />
        <Container12 />
        <Button4 />
        <Button5 />
      </div>
    </div>
  );
}

function Text28() {
  return (
    <div className="h-[15px] relative shrink-0 w-[53.75px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['DM_Sans:9pt_Regular',sans-serif] font-normal leading-[15px] left-0 text-[#6e6e80] text-[10px] top-0 whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 9' }}>
          18 variables
        </p>
      </div>
    </div>
  );
}

function Text29() {
  return (
    <div className="h-[15px] relative shrink-0 w-[35.969px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[15px] left-0 text-[#5e6ad2] text-[10px] top-0 whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
          View all
        </p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="relative shrink-0 w-[274px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative size-full">
        <Text28 />
        <Text29 />
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[11px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 11">
        <g clipPath="url(#clip0_9_5188)" id="Icon">
          <path d={svgPaths.p1a7a3080} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.916667" />
        </g>
        <defs>
          <clipPath id="clip0_9_5188">
            <rect fill="white" height="11" width="11" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text30() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[102.25px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[16.5px] left-[51.5px] text-[#fafafa] text-[11px] text-center top-0 whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
          Generate Variables
        </p>
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-[#0c0c0d] h-[32.5px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[6px] items-center justify-center relative size-full">
        <Icon2 />
        <Text30 />
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="relative shrink-0 w-[274px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[10px] relative size-full">
        <Button6 />
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[12px] pt-[5px] px-[12px] relative size-full">
        <Container36 />
        <Container37 />
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0.08)] border-solid border-t inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-px relative size-full">
        <Container35 />
      </div>
    </div>
  );
}

export default function PluginMockup() {
  return (
    <div className="bg-white content-stretch drop-shadow-[0px_24px_32px_rgba(0,0,0,0.14),0px_0px_0px_rgba(0,0,0,0.05)] flex flex-col items-start p-px relative rounded-[16px] size-full" data-name="PluginMockup">
      <div aria-hidden className="absolute border border-[rgba(0,0,0,0.08)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Container />
      <Container8 />
      <Container9 />
      <Container34 />
    </div>
  );
}
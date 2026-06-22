import svgPaths from "./svg-ihcs2do7o7";

function Container2() {
  return <div className="bg-[#ff5f57] relative rounded-[33554400px] shrink-0 size-[12px]" data-name="Container" />;
}

function Container3() {
  return <div className="bg-[#ffbd2e] relative rounded-[33554400px] shrink-0 size-[12px]" data-name="Container" />;
}

function Container4() {
  return <div className="bg-[#28c840] relative rounded-[33554400px] shrink-0 size-[12px]" data-name="Container" />;
}

function Container1() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[6px] items-start relative size-full">
        <Container2 />
        <Container3 />
        <Container4 />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[9px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 9">
        <g clipPath="url(#clip0_4_883)" id="Icon">
          <path d={svgPaths.p3542e280} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
          <path d={svgPaths.p15348c00} id="Vector_2" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
          <path d={svgPaths.p3defb690} id="Vector_3" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
        </g>
        <defs>
          <clipPath id="clip0_4_883">
            <rect fill="white" height="9" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container6() {
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

function Container5() {
  return (
    <div className="flex-[182.203_0_0] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[6px] items-center justify-center relative size-full">
        <Container6 />
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

function Container() {
  return (
    <div className="bg-[#f7f7f8] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0.08)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center pb-[13px] pt-[12px] px-[16px] relative size-full">
          <Container1 />
          <Container5 />
          <Text1 />
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Button">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0)] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="[word-break:break-word] bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col font-['DM_Sans:Medium',sans-serif] font-medium items-center justify-center leading-[15px] pb-[10px] pt-[8px] relative size-full text-[#6e6e80] text-[10px] text-center whitespace-nowrap">
        <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>{`🎨 `}</p>
        <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
          Colors
        </p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Button">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0)] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="[word-break:break-word] bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col font-['DM_Sans:Medium',sans-serif] font-medium items-center justify-center leading-[15px] pb-[10px] pt-[8px] relative size-full text-[#6e6e80] text-[10px] text-center whitespace-nowrap">
        <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>{`🆎 `}</p>
        <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
          Typography
        </p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Button">
      <div aria-hidden className="absolute border-[#5e6ad2] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="[word-break:break-word] bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col font-['DM_Sans:Medium',sans-serif] font-medium items-center justify-center leading-[15px] pb-[10px] pt-[8px] relative size-full text-[#5e6ad2] text-[10px] text-center whitespace-nowrap">
        <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
          📐
        </p>
        <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
          Layout
        </p>
      </div>
    </div>
  );
}

function Container7() {
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

function Button3() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Button">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0)] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="[word-break:break-word] bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center justify-center leading-[15px] pb-[10px] pt-[8px] relative size-full text-[#5e6ad2] text-[10px] text-center whitespace-nowrap">
        <p className="font-['DM_Sans:Medium',sans-serif] font-medium relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
          🧩
        </p>
        <p className="font-['DM_Sans:Medium',sans-serif] font-medium relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
          Grid
        </p>
        <p className="font-['Material_Symbols_Outlined:Regular',sans-serif] font-normal relative shrink-0" style={{ fontVariationSettings: '"FILL" 0, "GRAD" 0' }}>
          expand_less
        </p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[10px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
        <g clipPath="url(#clip0_4_879)" id="Icon">
          <path d={svgPaths.p1e4f3d00} id="Vector" stroke="var(--stroke-0, #6E6E80)" strokeWidth="0.9375" />
          <path d="M6.5625 6.5625L8.75 8.75" id="Vector_2" stroke="var(--stroke-0, #6E6E80)" strokeLinecap="round" strokeWidth="0.9375" />
        </g>
        <defs>
          <clipPath id="clip0_4_879">
            <rect fill="white" height="10" width="10" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-[#f2f2f4] h-[27px] relative rounded-[6px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[10px] py-[6px] relative size-full">
          <Icon1 />
          <p className="[word-break:break-word] font-['DM_Sans:9pt_Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#6e6e80] text-[10px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 9' }}>
            Search tokens…
          </p>
        </div>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0 w-[298px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[4px] pt-[12px] px-[12px] relative size-full">
        <Container10 />
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="bg-[#4b55c4] relative rounded-[4px] shrink-0 size-[24px]" data-name="Container">
      <div aria-hidden className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Text2() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] font-['Consolas:Regular',sans-serif] leading-[15px] not-italic relative shrink-0 text-[#0c0c0d] text-[10px] whitespace-nowrap">glutter</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="min-h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-center min-h-[inherit] px-[8px] py-[6px] relative size-full">
          <Container13 />
          <Text2 />
        </div>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="bg-[#5e6ad2] relative rounded-[4px] shrink-0 size-[24px]" data-name="Container">
      <div aria-hidden className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Text3() {
  return (
    <div className="flex-[172.359_0_0] min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center overflow-clip relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] font-['Consolas:Regular',sans-serif] leading-[15px] not-italic relative shrink-0 text-[#0c0c0d] text-[10px] whitespace-nowrap">collunns</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="relative rounded-[6px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center px-[8px] py-[6px] relative size-full">
          <Container15 />
          <Text3 />
        </div>
      </div>
    </div>
  );
}

function ContainerMargin() {
  return (
    <div className="min-h-[40px] relative shrink-0 w-full" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center min-h-[inherit] pt-[2px] relative size-full">
        <Container14 />
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="bg-[#6e6e80] relative rounded-[4px] shrink-0 size-[24px]" data-name="Container">
      <div aria-hidden className="absolute border border-[rgba(0,0,0,0.05)] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Text4() {
  return (
    <div className="flex-[172.359_0_0] min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center overflow-clip relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] font-['Consolas:Regular',sans-serif] leading-[15px] not-italic relative shrink-0 text-[#0c0c0d] text-[10px] whitespace-nowrap">padding</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="relative rounded-[6px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center px-[8px] py-[6px] relative size-full">
          <Container17 />
          <Text4 />
        </div>
      </div>
    </div>
  );
}

function ContainerMargin1() {
  return (
    <div className="min-h-[40px] relative shrink-0 w-full" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center min-h-[inherit] pt-[2px] relative size-full">
        <Container16 />
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0 w-[298px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-[8px] px-[12px] relative rounded-[inherit] size-full">
        <Container12 />
        <ContainerMargin />
        <ContainerMargin1 />
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Button">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0)] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="[word-break:break-word] bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center justify-center leading-[15px] pb-[10px] pt-[8px] relative size-full text-[#6e6e80] text-[10px] text-center whitespace-nowrap">
        <p className="font-['DM_Sans:Medium',sans-serif] font-medium relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
          📏
        </p>
        <p className="font-['DM_Sans:Medium',sans-serif] font-medium relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
          Space
        </p>
        <p className="font-['Material_Symbols_Outlined:Regular',sans-serif] font-normal relative shrink-0" style={{ fontVariationSettings: '"FILL" 0, "GRAD" 0' }}>
          expand_more
        </p>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Button">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0)] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="[word-break:break-word] bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center justify-center leading-[15px] pb-[10px] pt-[8px] relative size-full text-[#6e6e80] text-[10px] text-center whitespace-nowrap">
        <p className="font-['DM_Sans:Medium',sans-serif] font-medium relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
          🔶
        </p>
        <p className="font-['DM_Sans:Medium',sans-serif] font-medium relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
          Tokens
        </p>
        <p className="font-['Material_Symbols_Outlined:Regular',sans-serif] font-normal relative shrink-0" style={{ fontVariationSettings: '"FILL" 0, "GRAD" 0' }}>
          expand_more
        </p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="bg-white relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Button3 />
        <Container9 />
        <Container11 />
        <Button4 />
        <Button5 />
      </div>
    </div>
  );
}

function Text5() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="[word-break:break-word] font-['DM_Sans:9pt_Regular',sans-serif] font-normal leading-[15px] relative shrink-0 text-[#6e6e80] text-[10px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 9' }}>
          41 variables
        </p>
      </div>
    </div>
  );
}

function Text6() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="[word-break:break-word] font-['DM_Sans:Medium',sans-serif] font-medium leading-[15px] relative shrink-0 text-[#5e6ad2] text-[10px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
          View all
        </p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative size-full">
        <Text5 />
        <Text6 />
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[11px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 11">
        <g clipPath="url(#clip0_4_876)" id="Icon">
          <path d={svgPaths.p1a7a3080} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.916667" />
        </g>
        <defs>
          <clipPath id="clip0_4_876">
            <rect fill="white" height="11" width="11" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-[#0c0c0d] content-stretch flex gap-[6px] h-[32.5px] items-center justify-center py-[8px] relative rounded-[8px] shrink-0 w-[274px]" data-name="Button">
      <Icon2 />
      <p className="[word-break:break-word] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[16.5px] relative shrink-0 text-[#fafafa] text-[11px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        Generate Variables
      </p>
    </div>
  );
}

function ButtonMargin() {
  return (
    <div className="relative shrink-0 w-full" data-name="Button (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[10px] relative size-full">
        <Button6 />
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0.08)] border-solid border-t inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col items-start pb-[12px] pt-[5px] px-[12px] relative size-full">
        <Container19 />
        <ButtonMargin />
      </div>
    </div>
  );
}

function ContainerMargin2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[4px] relative size-full">
        <Container18 />
      </div>
    </div>
  );
}

export default function PluginMockup() {
  return (
    <div className="bg-white relative rounded-[16px] size-full" data-name="PluginMockup">
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] size-full">
        <Container />
        <Container7 />
        <Container8 />
        <ContainerMargin2 />
      </div>
      <div aria-hidden className="absolute border border-[rgba(0,0,0,0.08)] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_24px_64px_-12px_rgba(0,0,0,0.14),0px_0px_0px_1px_rgba(0,0,0,0.05)]" />
    </div>
  );
}